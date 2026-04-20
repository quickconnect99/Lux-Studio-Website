import type { ProjectBusiness, ProjectCategory } from "@/lib/types";

export type AdminTab = "projects" | "settings";

export type ProjectFormState = {
  id?: string;
  business: ProjectBusiness;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: ProjectCategory;
  carModel: string;
  location: string;
  year: string;
  coverImage: string;
  galleryImagesText: string;
  galleryCaptionsText: string;
  videoUrl: string;
  uploadedVideo: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  behindTheScenes: string;
};

export type SiteSettingsFormState = {
  // Brand
  brandName: string;
  brandMark: string;
  brandStrapline: string;
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactCity: string;
  // Social
  socialLinksText: string;
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoOgImage: string;
  // Hero
  heroEyebrow: string;
  heroHeadlineLead: string;
  heroHeadlineTrail: string;
  heroCopy: string;
  heroVideoUrl: string;
  // About
  aboutFounderNote: string;
  aboutPositioning: string;
  aboutValuesText: string; // one per line: "Title | Copy"
  // Services
  servicesText: string; // one per line: "01 | Title | Description | deliverable1, deliverable2"
};

export type CompletionContext = {
  hasQueuedCover: boolean;
  queuedGalleryCount: number;
};
