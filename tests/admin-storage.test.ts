import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAdminUploadSession,
  getAdminStoragePath,
  removeAdminFiles,
  removeUnreferencedAdminFiles,
  revalidateAdminPublicContent,
  uploadAdminFile,
  uploadAdminFiles
} from "../lib/admin-storage";

type FakeClientOptions = {
  uploadError?: unknown;
  removeError?: unknown;
  sessionToken?: string | null;
  projectData?: unknown;
  projectError?: unknown;
  settingsData?: unknown;
  settingsError?: unknown;
};

function createFile(name: string, size = 1_024, type = "image/jpeg") {
  return { name, size, type } as File;
}

function createFakeClient({
  uploadError = null,
  removeError = null,
  sessionToken = null,
  projectData = [],
  projectError = null,
  settingsData = [],
  settingsError = null
}: FakeClientOptions = {}) {
  const uploadedFiles: Array<{ path: string; file: File }> = [];
  const removedPaths: string[][] = [];
  const fileNamesByPath = new Map<string, string>();

  const bucket = {
    async upload(path: string, file: File) {
      uploadedFiles.push({ path, file });
      fileNamesByPath.set(path, file.name);
      return { error: uploadError };
    },
    getPublicUrl(path: string) {
      return {
        data: {
          publicUrl: `https://example.supabase.co/storage/v1/object/public/projects/${fileNamesByPath.get(path) ?? path}`
        }
      };
    },
    async remove(paths: string[]) {
      removedPaths.push(paths);
      return { error: removeError };
    }
  };

  const client = {
    auth: {
      async getSession() {
        return {
          data: {
            session: sessionToken ? { access_token: sessionToken } : null
          }
        };
      }
    },
    storage: {
      from() {
        return bucket;
      }
    },
    from(table: string) {
      return {
        async select() {
          return table === "projects"
            ? { data: projectData, error: projectError }
            : { data: settingsData, error: settingsError };
        }
      };
    }
  } as unknown as SupabaseClient;

  return { client, removedPaths, uploadedFiles };
}

const originalFetch = globalThis.fetch;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  }
});

test("uploads small files through Storage and returns their public URL", async () => {
  const { client, uploadedFiles } = createFakeClient();
  const file = createFile("cover.jpg");

  const publicUrl = await uploadAdminFile(client, file, "covers");

  assert.equal(
    publicUrl,
    "https://example.supabase.co/storage/v1/object/public/projects/cover.jpg"
  );
  assert.equal(uploadedFiles.length, 1);
  assert.match(uploadedFiles[0].path, /^covers\/[\w-]+\.jpg$/);
});

test("surfaces regular Storage upload failures", async () => {
  const uploadError = new Error("storage unavailable");
  const { client } = createFakeClient({ uploadError });

  await assert.rejects(
    () => uploadAdminFile(client, createFile("cover.jpg"), "covers"),
    uploadError
  );
});

test("requires an authenticated session before a resumable upload starts", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  const { client, uploadedFiles } = createFakeClient();
  const largeFile = createFile("reel.mp4", 6 * 1024 * 1024 + 1, "video/mp4");

  await assert.rejects(
    () => uploadAdminFile(client, largeFile, "videos"),
    /authenticated session is required/i
  );
  assert.equal(uploadedFiles.length, 0);
});

test("uploads batches in input order and reports completed files", async () => {
  const { client } = createFakeClient();
  const files = [
    createFile("one.jpg"),
    createFile("two.jpg"),
    createFile("three.jpg")
  ];
  const completed: string[] = [];

  const urls = await uploadAdminFiles(
    client,
    files,
    "gallery",
    (_count, file) => completed.push(file.name),
    2
  );

  assert.deepEqual(
    urls.map((url) => url.split("/").pop()),
    ["one.jpg", "two.jpg", "three.jpg"]
  );
  assert.deepEqual(completed.sort(), files.map((file) => file.name).sort());
});

test("coordinates save-scoped progress and uploaded URL cleanup data", async () => {
  const { client } = createFakeClient();
  const progress: Array<{ current: number; total: number } | null> = [];
  const uploaded: string[] = [];
  const session = createAdminUploadSession({
    supabase: client,
    totalFiles: 2,
    onProgress: (item) =>
      progress.push(item ? { current: item.current, total: item.total } : null),
    onUploaded: (url) => uploaded.push(url)
  });

  await session.uploadFile(createFile("cover.jpg"), "covers");
  await session.uploadFiles([createFile("gallery.jpg")], "gallery");
  session.finish();

  assert.equal(uploaded.length, 2);
  assert.deepEqual(progress, [
    { current: 1, total: 2 },
    { current: 2, total: 2 },
    null
  ]);
});

test("extracts, deduplicates, and removes only configured bucket paths", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  const { client, removedPaths } = createFakeClient();
  const validUrl =
    "https://example.supabase.co/storage/v1/object/public/projects/gallery/frame%2001.jpg";

  assert.equal(getAdminStoragePath(validUrl), "gallery/frame 01.jpg");
  assert.equal(
    getAdminStoragePath(
      "https://other.supabase.co/storage/v1/object/public/projects/gallery/frame.jpg"
    ),
    null
  );
  assert.equal(
    await removeAdminFiles(client, [validUrl, validUrl, "invalid"]),
    true
  );
  assert.deepEqual(removedPaths, [["gallery/frame 01.jpg"]]);
});

test("retains referenced media and removes only orphaned candidates", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  const referenced =
    "https://example.supabase.co/storage/v1/object/public/projects/gallery/referenced.jpg";
  const orphaned =
    "https://example.supabase.co/storage/v1/object/public/projects/gallery/orphaned.jpg";
  const { client, removedPaths } = createFakeClient({
    projectData: [{ gallery_items: `${referenced} | Caption` }]
  });

  assert.equal(
    await removeUnreferencedAdminFiles(client, [referenced, orphaned]),
    true
  );
  assert.deepEqual(removedPaths, [["gallery/orphaned.jpg"]]);
});

test("keeps cleanup candidates when reference lookup fails", async () => {
  const { client, removedPaths } = createFakeClient({
    projectError: new Error("query failed")
  });

  assert.equal(
    await removeUnreferencedAdminFiles(client, ["https://example.com/file"]),
    false
  );
  assert.deepEqual(removedPaths, []);
});

test("revalidates with the current bearer token and fails safely", async () => {
  const withoutSession = createFakeClient();
  assert.equal(
    await revalidateAdminPublicContent(withoutSession.client),
    false
  );

  const authenticated = createFakeClient({ sessionToken: "session-token" });
  let authorization = "";
  globalThis.fetch = async (_input, init) => {
    authorization = (init?.headers as Record<string, string>).Authorization;
    return new Response("{}", { status: 200 });
  };

  assert.equal(await revalidateAdminPublicContent(authenticated.client), true);
  assert.equal(authorization, "Bearer session-token");

  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  assert.equal(await revalidateAdminPublicContent(authenticated.client), false);
});
