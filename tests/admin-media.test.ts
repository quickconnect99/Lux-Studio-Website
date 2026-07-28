import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_IMAGE_BYTES,
  getInvalidMediaFiles
} from "../lib/admin-persistence";
import { getAdminStoragePath } from "../lib/admin-storage";

test("accepts supported image media and rejects spoofed or oversized files", () => {
  const valid = {
    name: "campaign.webp",
    size: 1024,
    type: "image/webp"
  };
  const spoofed = {
    name: "campaign.webp",
    size: 1024,
    type: "text/html"
  };
  const oversized = {
    name: "campaign.jpg",
    size: MAX_IMAGE_BYTES + 1,
    type: "image/jpeg"
  };

  assert.deepEqual(getInvalidMediaFiles([valid], "image"), []);
  assert.deepEqual(getInvalidMediaFiles([spoofed, oversized], "image"), [
    spoofed,
    oversized
  ]);
});

test("extracts only paths from the configured public storage bucket", () => {
  assert.equal(
    getAdminStoragePath(
      "https://example.supabase.co/storage/v1/object/public/projects/gallery/id.webp"
    ),
    "gallery/id.webp"
  );
  assert.equal(getAdminStoragePath("https://example.com/image.webp"), null);
});
