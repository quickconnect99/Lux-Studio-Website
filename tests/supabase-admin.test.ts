import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  createAdminSupabaseClient,
  isServiceRoleConfigured
} from "../lib/supabase-admin";

const originalEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

test("returns an explicit unconfigured state without service credentials", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  assert.equal(isServiceRoleConfigured(), false);
  assert.equal(createAdminSupabaseClient(), null);
});

test("creates a non-persistent admin client from runtime configuration", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";

  assert.equal(isServiceRoleConfigured(), true);
  assert.ok(createAdminSupabaseClient());
});
