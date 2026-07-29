import type { AdminProjectFieldKey } from "@/lib/admin-types";

type AdminProjectFieldMeta = {
  label: string;
  helpText: string;
};

export type GalleryFrameRole = {
  label: string;
  description: string;
};

export const adminProjectFieldMeta: Record<
  AdminProjectFieldKey,
  AdminProjectFieldMeta
> = {
  business: {
    label: "Business",
    helpText:
      "Appears on the project detail page and determines which business category the project belongs to on the website."
  },
  title: {
    label: "Title",
    helpText:
      "Used as the main heading on the project detail page and also appears on homepage cards and featured sections."
  },
  slug: {
    label: "Slug",
    helpText:
      "Forms the URL under /work/<slug>. Used for deep links, SEO, and opening the live page."
  },
  category: {
    label: "Category",
    helpText:
      "Displayed as the project category on the detail page and in overview surfaces such as Featured Projects."
  },
  carModel: {
    label: "Primary Subject",
    helpText:
      "Shown as the first metadata field on the project detail page and on project cards. For hospitality work, this should be the venue or property name."
  },
  location: {
    label: "Location",
    helpText:
      "Displayed as the location in project detail metadata and across multiple cards and overlays."
  },
  year: {
    label: "Year",
    helpText:
      "Appears in the project detail metadata grid and in content overviews as the time marker."
  },
  shortDescription: {
    label: "Short Description",
    helpText:
      "This is the short introduction under the project title. It is also used on homepage cards, Featured Projects, and the next-project block."
  },
  fullDescription: {
    label: "Full Description",
    helpText:
      "Forms the narrative section on the project detail page and is also surfaced in the homepage featured area."
  },
  behindTheScenes: {
    label: "Behind The Scenes",
    helpText:
      "Appears as its own background or production block on the project detail page."
  },
  coverImage: {
    label: "Cover Image",
    helpText:
      "This is the top hero visual on the project detail page, serves as the video poster, and is the image source for cards on the home and work pages."
  },
  gallery: {
    label: "Gallery",
    helpText:
      "The order controls the detail page layout: image 1 is shown as the large project visual below the narrative, while images 2+ appear below as supporting stills. Captions stay linked to their respective image."
  },
  video: {
    label: "Video",
    helpText:
      "When set, the video replaces the static main image on the project detail page. The cover image remains as the poster."
  },
  createdAt: {
    label: "Created At",
    helpText:
      "Controls sorting in the admin and the date used for structured video data on the live site."
  },
  featured: {
    label: "Featured",
    helpText: "Featured projects appear in the homepage featured section."
  },
  published: {
    label: "Published",
    helpText:
      "Only published projects are visible on the public website and reachable under /work/<slug>."
  }
};

export function getGalleryFrameRole(index: number): GalleryFrameRole {
  if (index === 0) {
    return {
      label: "Large project image",
      description:
        "Appears directly below the narrative section as the main still."
    };
  }

  return {
    label: "Supporting still",
    description: "Appears lower on the project page in the supporting gallery."
  };
}
