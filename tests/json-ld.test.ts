import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../lib/json-ld";

test("escapes script-closing characters in JSON-LD", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert('x')</script>"
  });

  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("\\u003c/script>"), true);
});
