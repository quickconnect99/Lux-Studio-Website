import type { Project } from "@/lib/types";

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
};

const imageFilePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

function isWebUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

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

export function buildFrameItems({
  selectedFrames,
  fallbackImages,
  galleryImages
}: {
  selectedFrames: string[];
  fallbackImages: string[];
  galleryImages: string[];
}) {
  const selectedImages: string[] = [];
  const selectedLinks: string[] = [];
  const directLinksByImage = new Map<string, string>();

  selectedFrames.forEach((entry) => {
    const parts = splitFrameEntry(entry);
    const image = parts.find(isLikelyImageUrl);
    const href = parts.find(
      (part) => isWebUrl(part) && !isLikelyImageUrl(part)
    );

    if (image) {
      selectedImages.push(image);
    }

    if (href) {
      selectedLinks.push(href);
    }

    if (image && href) {
      directLinksByImage.set(image, href);
    }
  });

  const images = dedupeImageUrls(
    selectedImages.length > 0
      ? [...selectedImages, ...galleryImages, ...fallbackImages]
      : [...galleryImages, ...fallbackImages]
  );

  return images.map((image, index) => ({
    image,
    href: directLinksByImage.get(image) ?? selectedLinks[index]
  }));
}

export function buildProjectFrameItems(
  projects: Array<Pick<Project, "slug" | "coverImage" | "galleryImages">>
) {
  const frames: FrameItem[] = [];
  const seen = new Set<string>();

  projects.forEach((project) => {
    const slug = project.slug.trim();

    if (!slug) {
      return;
    }

    [project.coverImage, ...project.galleryImages].forEach((entry) => {
      const image = entry.trim();

      if (!image || seen.has(image)) {
        return;
      }

      seen.add(image);
      frames.push({
        image,
        href: `/work/${encodeURIComponent(slug)}`
      });
    });
  });

  return frames;
}

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

  return { images, captions };
}
