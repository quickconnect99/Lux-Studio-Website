import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GET } from "../app/api/build-info/route";

const originalBuildSha = process.env.BUILD_SHA;

afterEach(() => {
  if (originalBuildSha === undefined) {
    delete process.env.BUILD_SHA;
  } else {
    process.env.BUILD_SHA = originalBuildSha;
  }
});

function createRequest() {
  return new Request("https://www.luxstudio.li/api/build-info");
}

test("reports the configured build SHA with a no-store, request-ID response", async () => {
  process.env.BUILD_SHA = "abc123";

  const response = await GET(createRequest());

  assert.deepEqual(await response.json(), { sha: "abc123" });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
});

test("reports null when no build SHA is configured (local dev)", async () => {
  delete process.env.BUILD_SHA;

  const response = await GET(createRequest());

  assert.deepEqual(await response.json(), { sha: null });
});
