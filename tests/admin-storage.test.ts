import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAdminUploadSession,
  getAdminSiteSettingsMediaUrls,
  getAdminStoragePath,
  getResumableAdminObjectName,
  removeAdminFiles,
  removeUnreferencedAdminFiles,
  revalidateAdminPublicContent,
  uploadAdminFile,
  uploadAdminFiles
} from "../lib/admin-storage";
import { toSiteSettingsFormState } from "../lib/admin-utils";
import { defaultSiteSettings } from "../lib/site-config";

type FakeClientOptions = {
  uploadError?: unknown;
  removeError?: unknown;
  sessionToken?: string | null;
  projectData?: unknown;
  projectDataSequence?: unknown[];
  projectError?: unknown;
  settingsData?: unknown;
  settingsDataSequence?: unknown[];
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
  projectDataSequence,
  projectError = null,
  settingsData = [],
  settingsDataSequence,
  settingsError = null
}: FakeClientOptions = {}) {
  const uploadedFiles: Array<{ path: string; file: File }> = [];
  const removedPaths: string[][] = [];
  const fileNamesByPath = new Map<string, string>();
  let projectSelectCount = 0;
  let settingsSelectCount = 0;

  function nextSequenceValue(
    sequence: unknown[] | undefined,
    fallback: unknown,
    index: number
  ) {
    if (!sequence || sequence.length === 0) return fallback;
    return sequence[Math.min(index, sequence.length - 1)];
  }

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
          if (table === "projects") {
            const data = nextSequenceValue(
              projectDataSequence,
              projectData,
              projectSelectCount
            );
            projectSelectCount += 1;
            return { data, error: projectError };
          }

          const data = nextSequenceValue(
            settingsDataSequence,
            settingsData,
            settingsSelectCount
          );
          settingsSelectCount += 1;
          return { data, error: settingsError };
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

test("resumable uploads retain the original object name", () => {
  assert.equal(
    getResumableAdminObjectName(
      {
        metadata: {
          bucketName: "projects",
          objectName: "videos/original-upload.mp4"
        }
      },
      "videos/new-random-id.mp4"
    ),
    "videos/original-upload.mp4"
  );
  assert.equal(
    getResumableAdminObjectName(
      {
        metadata: {
          bucketName: "other-bucket",
          objectName: "videos/original-upload.mp4"
        }
      },
      "videos/new-random-id.mp4"
    ),
    null
  );
  assert.equal(
    getResumableAdminObjectName(
      {
        metadata: {
          bucketName: "projects",
          objectName: "covers/original-upload.mp4"
        }
      },
      "videos/new-random-id.mp4"
    ),
    null
  );
});

test("collects selected and motion frames for site settings cleanup", () => {
  const formState = toSiteSettingsFormState(defaultSiteSettings);
  formState.heroVideoUrl = "https://example.com/hero.mp4";
  formState.selectedFramesText = JSON.stringify({
    image: "https://example.com/selected.jpg",
    href: "/work/example"
  });
  formState.motionFramesText = JSON.stringify({
    image: "https://example.com/motion.jpg"
  });
  formState.aboutTeamGalleryText = "https://example.com/team-gallery.jpg";
  formState.aboutTeamMembers = [
    {
      name: "Editor",
      title: "",
      position: "",
      description: "",
      image: "https://example.com/portrait.jpg"
    }
  ];

  assert.deepEqual(
    new Set(getAdminSiteSettingsMediaUrls(formState)),
    new Set([
      "https://example.com/hero.mp4",
      "https://example.com/selected.jpg",
      "https://example.com/motion.jpg",
      "https://example.com/team-gallery.jpg",
      "https://example.com/portrait.jpg"
    ])
  );
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

test("retains canonical frame, gallery item, and direct video references", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  const baseUrl =
    "https://example.supabase.co/storage/v1/object/public/projects";
  const selectedFrame = `${baseUrl}/selected-frames/selected.jpg`;
  const motionFrame = `${baseUrl}/selected-frames/motion.jpg`;
  const galleryItem = `${baseUrl}/gallery/gallery.jpg`;
  const directVideo = `${baseUrl}/videos/direct.mp4`;
  const orphaned = `${baseUrl}/gallery/orphaned.jpg`;
  const { client, removedPaths } = createFakeClient({
    projectData: [
      {
        gallery_items: [{ image: galleryItem, caption: "Frame" }],
        video_url: directVideo
      }
    ],
    settingsData: [
      {
        selected_frames: [
          JSON.stringify({ image: selectedFrame, href: "/work/example" })
        ],
        motion_frames: [JSON.stringify({ image: motionFrame })]
      }
    ]
  });

  assert.equal(
    await removeUnreferencedAdminFiles(client, [
      selectedFrame,
      motionFrame,
      galleryItem,
      directVideo,
      orphaned
    ]),
    true
  );
  assert.deepEqual(removedPaths, [["gallery/orphaned.jpg"]]);
});

test("rechecks references immediately before deleting storage objects", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  const candidate =
    "https://example.supabase.co/storage/v1/object/public/projects/gallery/reused.jpg";
  const { client, removedPaths } = createFakeClient({
    projectDataSequence: [[], [{ cover_image: candidate }]],
    settingsDataSequence: [[], []]
  });

  assert.equal(await removeUnreferencedAdminFiles(client, [candidate]), true);
  assert.deepEqual(removedPaths, []);
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
