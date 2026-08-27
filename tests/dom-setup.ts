import { JSDOM } from "jsdom";

/**
 * Installs a minimal jsdom environment for hook/component tests run under
 * Node's native test runner. Import this before any `@testing-library/react`
 * or `react-dom` import — React reads `window`/`document` at module init.
 */
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/"
});

const globalTarget = globalThis as Record<string, unknown>;

globalTarget.window = dom.window;
globalTarget.document = dom.window.document;
globalTarget.navigator = dom.window.navigator;

for (const property of Object.getOwnPropertyNames(dom.window)) {
  if (property in globalTarget) {
    continue;
  }

  const descriptor = Object.getOwnPropertyDescriptor(dom.window, property);
  if (descriptor) {
    Object.defineProperty(globalTarget, property, descriptor);
  }
}

// Node already defines URL/File/Blob without the browser object-URL APIs
// hooks rely on (e.g. `URL.createObjectURL`) — use jsdom's versions instead.
for (const property of ["URL", "File", "Blob", "FileReader"]) {
  const descriptor = Object.getOwnPropertyDescriptor(dom.window, property);
  if (descriptor) {
    Object.defineProperty(globalTarget, property, descriptor);
  }
}

// jsdom does not implement Blob object URLs; hooks only need a stable,
// revocable placeholder string, not real blob storage.
const urlConstructor = globalTarget.URL as unknown as {
  createObjectURL?: (blob: unknown) => string;
  revokeObjectURL?: (url: string) => void;
};
if (typeof urlConstructor.createObjectURL !== "function") {
  let objectUrlCounter = 0;
  urlConstructor.createObjectURL = () => `blob:mock-${++objectUrlCounter}`;
  urlConstructor.revokeObjectURL = () => {};
}

// React 19 requires an explicit opt-in outside jest/vitest presets.
globalTarget.IS_REACT_ACT_ENVIRONMENT = true;
