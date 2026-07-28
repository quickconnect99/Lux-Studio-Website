export type ProjectBusiness = string;

export type ProjectCategory = string;

export type GalleryItem = {
  image: string;
  caption: string;
  alt?: string;
};

export type Project = {
  id?: string;
  business: ProjectBusiness;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: ProjectCategory;
  carModel: string;
  location: string;
  year: number;
  coverImage: string;
  galleryImages: string[];
  galleryCaptions?: string[];
  galleryItems?: GalleryItem[];
  videoUrl?: string;
  uploadedVideo?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  behindTheScenes?: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type TeamMember = {
  name: string;
  title: string;
  position: string;
  description: string;
  image: string;
};

export type Service = {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
};

export type NavigationVisibility = {
  home: boolean;
  work: boolean;
  services: boolean;
  about: boolean;
  contact: boolean;
};

export type SiteCopy = {
  home: {
    selectedWorkLabel: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    videoHeadlineLead: string;
    videoHeadlineTrail: string;
    ctaEyebrow: string;
    ctaHeadlineLead: string;
    ctaHeadlineTrail: string;
    ctaCopy: string;
    ctaButton: string;
  };
  work: {
    eyebrow: string;
    headlineLead: string;
    headlineTrail: string;
    copy: string;
  };
  services: {
    eyebrow: string;
    headlineLead: string;
    headlineTrail: string;
    copy: string;
  };
  about: {
    eyebrow: string;
    headlineLead: string;
    headlineTrail: string;
    founderLabel: string;
    positioningLabel: string;
  };
  contact: {
    eyebrow: string;
    headlineLead: string;
    headlineTrail: string;
    copy: string;
    directLabel: string;
    directCopy: string;
    formLabel: string;
    submitLabel: string;
  };
  footer: {
    headline: string;
    navigationLabel: string;
    connectLabel: string;
    mediaNotice: string;
  };
};

export type SiteSettings = {
  updatedAt: string;
  brand: {
    name: string;
    mark: string;
    strapline: string;
  };
  contact: {
    email: string;
    phone: string;
    city: string;
  };
  social: SocialLink[];
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    headlineLead: string;
    headlineTrail: string;
    copy: string;
    videoUrl: string;
  };
  about: {
    founderNote: string;
    positioning: string;
    values: Array<{ title: string; copy: string }>;
    teamMembers: TeamMember[];
    teamGallery: string[];
  };
  services: Service[];
  selectedFrames: string[];
  motionFrames: string[];
  navigation: NavigationVisibility;
  copy: SiteCopy;
};

export type InquiryServiceType =
  | "Commercial Shoot"
  | "Social Content"
  | "Event Coverage"
  | "Brand Campaign"
  | "Other";

export type Inquiry = {
  name: string;
  email: string;
  company: string;
  serviceType: InquiryServiceType | "";
  brief: string;
};
