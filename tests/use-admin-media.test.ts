import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import type { ChangeEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { useAdminMedia } from "../hooks/use-admin-media";

function file(name: string, type: string, content = "x") {
  return new File([content], name, { type });
}

function renderMedia() {
  const changes: number[] = [];
  const errors: string[] = [];
  const view = renderHook(() =>
    useAdminMedia({
      onChange: () => changes.push(1),
      onError: (message) => errors.push(message)
    })
  );
  return { ...view, changes, errors };
}

test("setCoverFile stores the file, creates a preview URL, and notifies onChange", () => {
  const { result, changes } = renderMedia();
  const cover = file("cover.jpg", "image/jpeg");

  act(() => {
    result.current.setCoverFile(cover);
  });

  assert.equal(result.current.coverFile, cover);
  assert.ok(result.current.coverPreviewUrl?.startsWith("blob:"));
  assert.equal(changes.length, 1);
});

test("addGalleryFiles rejects an unsupported file without mutating the queue", () => {
  const { result, errors } = renderMedia();
  const bad = file("notes.txt", "text/plain");

  act(() => {
    result.current.addGalleryFiles([bad]);
  });

  assert.deepEqual(result.current.galleryFiles, []);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /notes\.txt/);
});

test("addGalleryFiles appends valid images and removeGalleryFile removes by index", () => {
  const { result } = renderMedia();
  const first = file("a.jpg", "image/jpeg");
  const second = file("b.png", "image/png");

  act(() => {
    result.current.addGalleryFiles([first, second]);
  });
  assert.deepEqual(result.current.galleryFiles, [first, second]);

  act(() => {
    result.current.removeGalleryFile(0);
  });
  assert.deepEqual(result.current.galleryFiles, [second]);
});

test("clearProjectMedia only clears the project-scoped queues", () => {
  const { result } = renderMedia();

  act(() => {
    result.current.setCoverFile(file("cover.jpg", "image/jpeg"));
    result.current.addGalleryFiles([file("a.jpg", "image/jpeg")]);
    result.current.addSelectedFrameFiles([file("frame.jpg", "image/jpeg")]);
  });

  act(() => {
    result.current.clearProjectMedia();
  });

  assert.equal(result.current.coverFile, null);
  assert.deepEqual(result.current.galleryFiles, []);
  assert.equal(result.current.selectedFrameFiles.length, 1);
});

test("handleFileSelection resets the input value when the selected file is invalid", () => {
  const { result } = renderMedia();
  const input = document.createElement("input");
  input.type = "file";
  const bad = file("notes.txt", "text/plain");
  Object.defineProperty(input, "files", { value: [bad], writable: false });
  Object.defineProperty(input, "value", {
    value: "C:\\fakepath\\notes.txt",
    writable: true
  });

  act(() => {
    result.current.handleFileSelection(
      { target: input } as unknown as ChangeEvent<HTMLInputElement>,
      "cover"
    );
  });

  assert.equal(input.value, "");
  assert.equal(result.current.coverFile, null);
});
