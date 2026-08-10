import assert from "node:assert/strict";
import test from "node:test";
import { createRevalidateHandler } from "../app/api/admin/revalidate/route";

function createRequest(headers: Record<string, string> = {}) {
  return new Request("https://www.luxstudio.li/api/admin/revalidate", {
    method: "POST",
    headers: {
      origin: "https://www.luxstudio.li",
      "x-request-id": "revalidate-test-request",
      ...headers
    }
  });
}

test("rejects revalidation from a different origin", async () => {
  const handler = createRevalidateHandler({
    checkAdmin: async () => ({ data: true, error: null }),
    revalidate() {}
  });
  const response = await handler(
    createRequest({ origin: "https://attacker.example" })
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-request-id"), "revalidate-test-request");
});

test("requires an admin bearer session", async () => {
  const handler = createRevalidateHandler({
    checkAdmin: async () => ({ data: true, error: null }),
    revalidate() {}
  });

  assert.equal((await handler(createRequest())).status, 401);
});

test("rejects a non-admin session without revalidating", async () => {
  let revalidated = false;
  const handler = createRevalidateHandler({
    checkAdmin: async (token) => {
      assert.equal(token, "user-token");
      return { data: false, error: null };
    },
    revalidate() {
      revalidated = true;
    }
  });

  const response = await handler(
    createRequest({ authorization: "Bearer user-token" })
  );

  assert.equal(response.status, 403);
  assert.equal(revalidated, false);
});

test("revalidates the public layout for an authenticated admin", async () => {
  let revalidated = false;
  const handler = createRevalidateHandler({
    checkAdmin: async () => ({ data: true, error: null }),
    revalidate() {
      revalidated = true;
    }
  });

  const response = await handler(
    createRequest({ authorization: "Bearer admin-token" })
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { revalidated: true });
  assert.equal(revalidated, true);
});
