import type {
  Project,
  ProjectBusiness,
  ProjectCategory,
  Service,
  SiteCopy,
  SocialLink,
  TeamMember
} from "@/lib/types";

export type AdminTab = "projects" | "settings" | "users" | "email";

export type AdminAccountSummary = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  isAdmin: boolean;
};

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
  galleryAltsText: string;
  videoUrl: string;
  uploadedVideo: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  behindTheScenes: string;
};

export type SiteSettingsFormState = {
  updatedAt: string;
  // Brand
  brandName: string;
  brandMark: string;
  brandStrapline: string;
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactCity: string;
  // Social
  socialLinks: SocialLink[];
  // SEO
  seoTitle: string;
  seoDescription: string;
  // Hero
  heroEyebrow: string;
  heroHeadlineLead: string;
  heroHeadlineTrail: string;
  heroCopy: string;
  heroVideoUrl: string;
  // About
  aboutFounderNote: string;
  aboutPositioning: string;
  aboutTeamMembers: TeamMember[];
  aboutTeamGalleryText: string;
  aboutValues: Array<{ title: string; copy: string }>;
  // Services
  services: Service[];
  // Selected frames
  selectedFramesText: string;
  // Moving project frames
  motionFramesText: string;
  // Navigation visibility
  navigationHome: boolean;
  navigationWork: boolean;
  navigationServices: boolean;
  navigationAbout: boolean;
  navigationContact: boolean;
  copy: SiteCopy;
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

export type AdminUploadProgress = {
  current: number;
  total: number;
  filename: string;
};

export type AdminConfirmDialogState = {
  action: "delete" | "reset" | "workflow";
  title: string;
  description: string;
  confirmLabel: string;
  secondaryLabel?: string;
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
