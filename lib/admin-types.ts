import type { Project, ProjectBusiness, ProjectCategory } from "@/lib/types";

export type AdminTab = "projects" | "settings";

export type AdminProjectFieldKey =
  | "business"
  | "title"
  | "slug"
  | "category"
  | "carModel"
  | "location"
  | "year"
  | "shortDescription"
  | "fullDescription"
  | "behindTheScenes"
  | "coverImage"
  | "gallery"
  | "video"
  | "createdAt"
  | "featured"
  | "published";

export type ProjectFormState = {
  id?: string;
  templateBusiness?: ProjectBusiness;
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

export type SlugValidationState = {
  status: "idle" | "checking" | "available" | "conflict";
  slug: string;
  message: string | null;
  suggestedSlug: string | null;
};

export type AdminSaveReportItem = {
  id: string;
  label: string;
  detail?: string;
  tone: "success" | "warning" | "info";
};

export type AdminSaveReport = {
  title: string;
  items: AdminSaveReportItem[];
};

export type AdminConfirmDialogState = {
  action: "delete" | "reset";
  title: string;
  description: string;
  confirmLabel: string;
  tone: "default" | "danger";
  requireMatchText?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue: string;
};

export type AdminProjectListItem = Project & {
  adminKey: string;
  isTemplate?: boolean;
  templateBusiness?: ProjectBusiness;
};
