import assert from "node:assert/strict";
import test from "node:test";
import { resolveVideoSource } from "../lib/video";

test("accepts exact and official subdomain video providers", () => {
  assert.equal(
    resolveVideoSource("https://www.youtube.com/watch?v=abc123")?.kind,
    "youtube"
  );
  assert.equal(
    resolveVideoSource("https://player.vimeo.com/video/123456")?.kind,
    "vimeo"
  );
});

test("does not treat lookalike provider hosts as trusted embeds", () => {
  const youtubeLookalike = resolveVideoSource(
    "https://youtube.com.attacker.example/watch?v=abc123"
  );
  const vimeoLookalike = resolveVideoSource(
    "https://vimeo.com.attacker.example/123456"
  );

  assert.equal(youtubeLookalike?.kind, "file");
  assert.equal(vimeoLookalike?.kind, "file");
});

test("rejects executable and protocol-relative video references", () => {
  assert.equal(resolveVideoSource("javascript:alert(1)"), null);
  assert.equal(resolveVideoSource("//attacker.example/video.mp4"), null);
  assert.equal(resolveVideoSource("/\\attacker.example/video.mp4"), null);
  assert.equal(resolveVideoSource("/%5Cattacker.example/video.mp4"), null);
  assert.equal(resolveVideoSource("/media/project-reel.mp4")?.kind, "file");
});

test("only builds provider embeds from safe provider IDs", () => {
  assert.equal(
    resolveVideoSource("https://www.youtube.com/watch?v=abc%2F123")?.kind,
    "file"
  );
  assert.equal(
    resolveVideoSource("https://www.youtube.com/embed/%3Cscript%3E")?.kind,
    "file"
  );
});
