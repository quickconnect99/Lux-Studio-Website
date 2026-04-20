import type { Project } from "@/lib/types";

export type VideoSource = {
  kind: "youtube" | "vimeo" | "file";
  src: string;
  label: string;
  externalHref: string;
};

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getYouTubeId(value: string) {
  const url = parseUrl(value);

  if (!url) {
    return null;
  }

  if (url.hostname.includes("youtu.be")) {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (url.hostname.includes("youtube.com")) {
    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }

    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[0] === "embed" || segments[0] === "shorts") {
      return segments[1] ?? null;
    }
  }

  return null;
}

function getVimeoId(value: string) {
  const url = parseUrl(value);

  if (!url || !url.hostname.includes("vimeo.com")) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const numericSegment = segments.find((segment) => /^\d+$/.test(segment));

  return numericSegment ?? null;
}

export function resolveVideoSource(value: string | undefined) {
  const source = value?.trim();

  if (!source) {
    return null;
  }

  const youtubeId = getYouTubeId(source);

  if (youtubeId) {
    return {
      kind: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      label: "YouTube",
      externalHref: source
    } satisfies VideoSource;
  }

  const vimeoId = getVimeoId(source);

  if (vimeoId) {
    return {
      kind: "vimeo",
      src: `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`,
      label: "Vimeo",
      externalHref: source
    } satisfies VideoSource;
  }

  return {
    kind: "file",
    src: source,
    label: source.startsWith("http") ? "Direct Video URL" : "Uploaded MP4",
    externalHref: source
  } satisfies VideoSource;
}

export function getProjectVideoSource(project: Project) {
  return resolveVideoSource(project.uploadedVideo || project.videoUrl);
}
