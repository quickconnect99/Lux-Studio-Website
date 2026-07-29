import type { Metadata } from "next";
import { DEFAULT_PROJECT_IMAGE } from "@/lib/site-config";
import type { Project, SiteSettings } from "@/lib/types";
import { buildFrameItems, isLikelyImageUrl } from "@/lib/project-images";

type SharingMetadataOptions = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  siteName: string;
  type?: "website" | "article";
};

type SharingImageOptions = {
  preferredImages?: Array<string | null | undefined>;
  projects?: Project[];
  settings?: Pick<SiteSettings, "selectedFrames">;
};

export function resolveSharingImage({
  preferredImages = [],
  projects = [],
  settings
}: SharingImageOptions = {}) {
  const entries = [
    ...preferredImages,
    ...projects.map((project) => project.coverImage),
    ...(settings?.selectedFrames ?? []),
    DEFAULT_PROJECT_IMAGE
  ];
  const candidates = entries.flatMap((entry) => {
    if (!entry?.trim()) {
      return [];
    }

    return buildFrameItems({
      selectedFrames: [entry],
      fallbackImages: [],
      galleryImages: []
    }).map((frame) => frame.image);
  });

  return (
    candidates.find((candidate): candidate is string =>
      Boolean(candidate?.trim() && isLikelyImageUrl(candidate))
    ) ?? DEFAULT_PROJECT_IMAGE
  );
}

export function buildSharingMetadata({
  title,
  description,
  image,
  imageAlt,
  siteName,
  type = "website"
}: SharingMetadataOptions): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type,
      siteName,
      locale: "en_US",
      images: [{ url: image, alt: imageAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}
