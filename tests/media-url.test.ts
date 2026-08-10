import assert from "node:assert/strict";
import test from "node:test";
import {
  filterPublicMediaUrls,
  normalizePublicMediaUrl
} from "../lib/media-url";

test("keeps repository and HTTP media while rejecting unsafe schemes", () => {
  assert.equal(
    normalizePublicMediaUrl(" /images/still.jpg "),
    "/images/still.jpg"
  );
  assert.equal(
    normalizePublicMediaUrl("https://cdn.example.com/still.jpg"),
    "https://cdn.example.com/still.jpg"
  );
  assert.equal(normalizePublicMediaUrl("javascript:alert(1)"), "");
  assert.equal(normalizePublicMediaUrl("data:image/svg+xml,unsafe"), "");
  assert.equal(normalizePublicMediaUrl("//cdn.example.com/still.jpg"), "");
  assert.equal(normalizePublicMediaUrl("/\\attacker.example/still.jpg"), "");
  assert.equal(normalizePublicMediaUrl("/%5Cattacker.example/still.jpg"), "");
  assert.equal(normalizePublicMediaUrl(42), "");
});

test("filters invalid public media entries without changing order", () => {
  assert.deepEqual(
    filterPublicMediaUrls([
      "/images/one.jpg",
      42,
      "file:///Users/example/two.jpg",
      "https://cdn.example.com/three.jpg"
    ]),
    ["/images/one.jpg", "https://cdn.example.com/three.jpg"]
  );
});
