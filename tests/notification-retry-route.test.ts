import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createNotificationRetryHandler } from "../app/api/admin/notifications/route";

const originalCronSecret = process.env.CRON_SECRET;

afterEach(() => {
  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = originalCronSecret;
  }
});

function createRequest(secret = "cron-secret") {
  return new Request("https://www.luxstudio.li/api/admin/notifications", {
    headers: {
      authorization: `Bearer ${secret}`,
      "x-request-id": "notification-test-request"
    }
  });
}

const notificationRow = {
  inquiry_id: "c14f7cf6-1908-4544-8fe7-6e6c5d3ef627",
  name: "Ada",
  email: "ada@example.com",
  company: "Analytical Studio",
  service_type: "Brand Campaign",
  brief: "A complete campaign inquiry.",
  notification_attempts: 2
};

test("protects notification retries with the cron bearer secret", async () => {
  process.env.CRON_SECRET = "cron-secret";
  const handler = createNotificationRetryHandler({
    claim: async () => ({ data: [], error: null }),
    mark: async () => null,
    send: async () => ({ skipped: false })
  });

  const response = await handler(createRequest("wrong-secret"));

  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    response.headers.get("x-request-id"),
    "notification-test-request"
  );
});

test("retries claimed notifications with the inquiry id as idempotency key", async () => {
  process.env.CRON_SECRET = "cron-secret";
  const marked: Array<{ id: string; status: string; sentAt: string | null }> =
    [];
  const handler = createNotificationRetryHandler({
    claim: async () => ({ data: [notificationRow], error: null }),
    async mark(id, status, sentAt) {
      marked.push({ id, status, sentAt });
      return null;
    },
    async send(inquiry, options) {
      assert.equal(inquiry.email, "ada@example.com");
      assert.equal(options.idempotencyKey, notificationRow.inquiry_id);
      return { skipped: false };
    }
  });

  const response = await handler(createRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    claimed: 1,
    sent: 1,
    skipped: 0,
    failed: 0
  });
  assert.equal(marked[0]?.id, notificationRow.inquiry_id);
  assert.equal(marked[0]?.status, "sent");
  assert.match(marked[0]?.sentAt ?? "", /^\d{4}-\d{2}-\d{2}T/);
});

test("keeps failed deliveries retryable without exposing inquiry data", async () => {
  process.env.CRON_SECRET = "cron-secret";
  const marked: string[] = [];
  const handler = createNotificationRetryHandler({
    claim: async () => ({ data: [notificationRow], error: null }),
    async mark(_id, status) {
      marked.push(status);
      return null;
    },
    async send() {
      throw new Error("provider unavailable");
    }
  });

  const response = await handler(createRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    claimed: 1,
    sent: 0,
    skipped: 0,
    failed: 1
  });
  assert.deepEqual(marked, ["failed"]);
});

test("fails closed on malformed claim results", async () => {
  process.env.CRON_SECRET = "cron-secret";
  const handler = createNotificationRetryHandler({
    claim: async () => ({ data: [{ inquiry_id: "incomplete" }], error: null }),
    mark: async () => null,
    send: async () => ({ skipped: false })
  });

  assert.equal((await handler(createRequest())).status, 500);
});
