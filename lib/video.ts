import type { Project } from "@/lib/types";
import { normalizePublicMediaUrl } from "@/lib/media-url";

export type VideoSource = {
  kind: "youtube" | "vimeo" | "file";
  src: string;
  label: string;
  externalHref: string;
};

function parseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function matchesHost(hostname: string, canonicalHost: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === canonicalHost || normalized.endsWith(`.${canonicalHost}`)
  );
}

function normalizeYouTubeId(value: string | null | undefined) {
  const id = value?.trim() ?? "";
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id) ? id : null;
}

function getYouTubeId(value: string) {
  const url = parseUrl(value);

  if (!url) {
    return null;
  }

  if (url.hostname.toLowerCase() === "youtu.be") {
    return normalizeYouTubeId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (matchesHost(url.hostname, "youtube.com")) {
    if (url.pathname === "/watch") {
      return normalizeYouTubeId(url.searchParams.get("v"));
    }

    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[0] === "embed" || segments[0] === "shorts") {
      return normalizeYouTubeId(segments[1]);
    }
  }

  return null;
}

function getVimeoId(value: string) {
  const url = parseUrl(value);

  if (!url || !matchesHost(url.hostname, "vimeo.com")) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const numericSegment = segments.find((segment) => /^\d+$/.test(segment));

  return numericSegment ?? null;
}

export function resolveVideoSource(value: string | undefined) {
  const source = normalizePublicMediaUrl(value);

  if (!source) {
    return null;
  }

  const isRepositoryPath = source.startsWith("/") && !source.startsWith("//");
  const publicUrl = parseUrl(source);

  if (!isRepositoryPath && !publicUrl) {
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
