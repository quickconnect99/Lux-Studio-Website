import assert from "node:assert/strict";
import test from "node:test";
import {
  createAdminUsersDeleteHandler,
  createAdminUsersGetHandler,
  createAdminUsersPostHandler
} from "../app/api/admin/users/route";

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const PENDING_ID = "22222222-2222-2222-2222-222222222222";

function createRequest(
  method: string,
  {
    headers = {},
    body
  }: { headers?: Record<string, string>; body?: unknown } = {}
) {
  return new Request("https://www.luxstudio.li/api/admin/users", {
    method,
    headers: {
      origin: "https://www.luxstudio.li",
      "x-request-id": "admin-users-test-request",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...headers
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
}

function createDependencies(overrides: Record<string, unknown> = {}) {
  return {
    checkAdmin: async () => ({ data: true, error: null }),
    getCallerId: async () => ADMIN_ID,
    listAuthUsers: async () => ({
      data: [
        {
          id: ADMIN_ID,
          email: "owner@luxstudio.li",
          createdAt: "2026-01-01T00:00:00.000Z",
          lastSignInAt: "2026-08-01T00:00:00.000Z"
        },
        {
          id: PENDING_ID,
          email: "nico@example.com",
          createdAt: "2026-08-05T00:00:00.000Z",
          lastSignInAt: null
        }
      ],
      error: null
    }),
    listAdminIds: async () => ({ data: [ADMIN_ID], error: null }),
    addAdmin: async () => ({ error: null }),
    removeAdmin: async () => ({ error: null }),
    ...overrides
  };
}

test("rejects requests from a different origin", async () => {
  const handler = createAdminUsersGetHandler(createDependencies());
  const response = await handler(
    createRequest("GET", { headers: { origin: "https://attacker.example" } })
  );

  assert.equal(response.status, 403);
});

test("requires an admin bearer session", async () => {
  const handler = createAdminUsersGetHandler(createDependencies());
  const response = await handler(createRequest("GET"));

  assert.equal(response.status, 401);
});

test("rejects a non-admin session", async () => {
  const handler = createAdminUsersGetHandler(
    createDependencies({
      checkAdmin: async () => ({ data: false, error: null })
    })
  );
  const response = await handler(
    createRequest("GET", { headers: { authorization: "Bearer user-token" } })
  );

  assert.equal(response.status, 403);
});

test("lists Supabase accounts merged with admin_users membership", async () => {
  const handler = createAdminUsersGetHandler(createDependencies());
  const response = await handler(
    createRequest("GET", { headers: { authorization: "Bearer admin-token" } })
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(
    body.accounts.map((account: { id: string; isAdmin: boolean }) => [
      account.id,
      account.isAdmin
    ]),
    [
      [PENDING_ID, false],
      [ADMIN_ID, true]
    ]
  );
});

test("grants admin access to a pending account", async () => {
  let grantedUserId: string | null = null;
  const handler = createAdminUsersPostHandler(
    createDependencies({
      addAdmin: async (userId: string) => {
        grantedUserId = userId;
        return { error: null };
      }
    })
  );

  const response = await handler(
    createRequest("POST", {
      headers: { authorization: "Bearer admin-token" },
      body: { userId: PENDING_ID }
    })
  );

  assert.equal(response.status, 200);
  assert.equal(grantedUserId, PENDING_ID);
});

test("rejects granting access with a malformed userId", async () => {
  const handler = createAdminUsersPostHandler(createDependencies());
  const response = await handler(
    createRequest("POST", {
      headers: { authorization: "Bearer admin-token" },
      body: { userId: "not-a-uuid" }
    })
  );

  assert.equal(response.status, 400);
});

test("revokes admin access from another account", async () => {
  let revokedUserId: string | null = null;
  const handler = createAdminUsersDeleteHandler(
    createDependencies({
      removeAdmin: async (userId: string) => {
        revokedUserId = userId;
        return { error: null };
      }
    })
  );

  const response = await handler(
    createRequest("DELETE", {
      headers: { authorization: "Bearer admin-token" },
      body: { userId: PENDING_ID }
    })
  );

  assert.equal(response.status, 200);
  assert.equal(revokedUserId, PENDING_ID);
});

test("blocks an admin from revoking their own access", async () => {
  const handler = createAdminUsersDeleteHandler(createDependencies());
  const response = await handler(
    createRequest("DELETE", {
      headers: { authorization: "Bearer admin-token" },
      body: { userId: ADMIN_ID }
    })
  );

  assert.equal(response.status, 400);
});
