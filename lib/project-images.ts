import type { Project } from "@/lib/types";

/** Trims image URLs and removes blanks and later duplicates in stable order. */
export function dedupeImageUrls(images: string[]) {
  const seen = new Set<string>();

  return images
    .map((image) => image.trim())
    .filter((image) => {
      if (!image || seen.has(image)) {
        return false;
      }

      seen.add(image);
      return true;
    });
}

export type FrameItem = {
  image: string;
  href?: string;
  alt?: string;
  projectTitle?: string;
};

const imageFilePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

function isWebUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function isLinkValue(value: string) {
  return (value.startsWith("/") || isWebUrl(value)) && !isLikelyImageUrl(value);
}

/**
 * Performs a conservative format check for local, hosted, and Supabase image
 * URLs used by the CMS frame parser.
 */
export function isLikelyImageUrl(value: string) {
  const source = value.trim();

  return (
    source.startsWith("/images/") ||
    imageFilePattern.test(source) ||
    /^https?:\/\/[^/]+\/storage\/v1\/object\/public\//i.test(source)
  );
}

function splitFrameEntry(entry: string) {
  const parts = entry
    .split(/\s*(?:\||->)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts : [entry.trim()];
}

function parseStructuredFrameEntry(entry: string): FrameItem | null {
  try {
    const value = JSON.parse(entry) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const record = value as Record<string, unknown>;
    const image = typeof record.image === "string" ? record.image.trim() : "";
    const href = typeof record.href === "string" ? record.href.trim() : "";

    if (!isLikelyImageUrl(image) || (href && !isLinkValue(href))) {
      return null;
    }

    return { image, href: href || undefined };
  } catch {
    return null;
  }
}

/**
 * Parses the flexible Selected/Motion Frames storage format.
 *
 * Entries may be JSON (`{"image":"...","href":"..."}`), a legacy
 * `image | link` string, or separate image/link lines. Explicit selections win;
 * gallery and fallback images are used only when no selected image is valid.
 */
export function buildFrameItems({
  selectedFrames,
  fallbackImages,
  galleryImages
}: {
  selectedFrames: string[];
  fallbackImages: string[];
  galleryImages: string[];
}) {
  const selectedItems: FrameItem[] = [];
  const selectedLinks: string[] = [];

  selectedFrames.forEach((entry) => {
    const structuredFrame = parseStructuredFrameEntry(entry);
    if (structuredFrame) {
      selectedItems.push(structuredFrame);
      if (structuredFrame.href) selectedLinks.push(structuredFrame.href);
      return;
    }

    const parts = splitFrameEntry(entry);
    const image = parts.find(isLikelyImageUrl);
    const href = parts.find(isLinkValue);

    if (image) {
      selectedItems.push({ image, href });
    }

    if (href) {
      selectedLinks.push(href);
    }
  });

  if (selectedItems.length > 0) {
    const seen = new Set<string>();

    return selectedItems
      .map((item, index) => ({
        ...item,
        href: item.href ?? selectedLinks[index]
      }))
      .filter((item) => {
        const key = `${item.image}\u0000${item.href ?? ""}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
  }

  return dedupeImageUrls([...galleryImages, ...fallbackImages]).map(
    (image, index) => ({
      image,
      href: selectedLinks[index]
    })
  );
}

/** Serializes a frame into the canonical JSON format written by the admin UI. */
export function serializeFrameItem(frame: FrameItem) {
  return JSON.stringify({
    image: frame.image,
    ...(frame.href ? { href: frame.href } : {})
  });
}

/**
 * Associates selected frame images with their owning public project.
 *
 * Explicit saved links are preserved. Otherwise a matching project image
 * infers `/work/<slug>`, which makes each moving frame open the correct project.
 */
export function buildProjectFrameItems(
  projects: Array<
    Pick<Project, "title" | "slug" | "coverImage" | "galleryImages">
  >,
  preferredImages: string[] = []
) {
  const frames: FrameItem[] = [];

  projects.forEach((project) => {
    const slug = project.slug.trim();
    const seenInProject = new Set<string>();

    if (!slug) {
      return;
    }

    [project.coverImage, ...project.galleryImages].forEach((entry) => {
      const image = entry.trim();

      if (!image || seenInProject.has(image)) {
        return;
      }

      seenInProject.add(image);
      frames.push({
        image,
        href: `/work/${encodeURIComponent(slug)}`,
        alt: `${project.title} project still`,
        projectTitle: project.title
      });
    });
  });

  if (preferredImages.length === 0) {
    return frames;
  }

  const projectFramesByImage = new Map<string, FrameItem[]>();
  frames.forEach((frame) => {
    projectFramesByImage.set(frame.image, [
      ...(projectFramesByImage.get(frame.image) ?? []),
      frame
    ]);
  });
  const preferredFrames = buildFrameItems({
    selectedFrames: preferredImages,
    fallbackImages: [],
    galleryImages: []
  });
  const usedMatches = new Map<string, number>();

  return preferredFrames.map((frame) => {
    const matches = projectFramesByImage.get(frame.image) ?? [];
    const explicitMatch = frame.href
      ? matches.find((match) => match.href === frame.href)
      : undefined;
    const matchIndex = usedMatches.get(frame.image) ?? 0;
    const inferredMatch = explicitMatch ?? matches[matchIndex] ?? matches[0];

    if (!explicitMatch && inferredMatch) {
      usedMatches.set(frame.image, matchIndex + 1);
    }

    return {
      ...inferredMatch,
      ...frame,
      href: frame.href ?? inferredMatch?.href,
      alt: inferredMatch?.alt,
      projectTitle: inferredMatch?.projectTitle
    };
  });
}

/**
 * Normalizes a project gallery while preserving image/caption index alignment.
 *
 * Empty URLs, duplicate gallery images, and the cover image are removed. The
 * result exposes both parallel arrays for legacy callers and structured items
 * for newer rendering code.
 */
export function normalizeProjectGallery({
  coverImage,
  galleryImages,
  galleryCaptions
}: {
  coverImage: string;
  galleryImages: string[];
  galleryCaptions: string[];
}) {
  const seen = new Set<string>();
  const normalizedCover = coverImage.trim();

  if (normalizedCover) {
    seen.add(normalizedCover);
  }

  const images: string[] = [];
  const captions: string[] = [];

  galleryImages.forEach((image, index) => {
    const normalizedImage = image.trim();

    if (!normalizedImage || seen.has(normalizedImage)) {
      return;
    }

    seen.add(normalizedImage);
    images.push(normalizedImage);
    captions.push((galleryCaptions[index] ?? "").trim());
  });

  return {
    images,
    captions,
    items: images.map((image, index) => ({
      image,
      caption: captions[index] ?? ""
    }))
  };
}
