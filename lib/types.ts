export type ProjectBusiness = "Car" | "Hospitality";

export type ProjectCategory =
  | "Brand Film"
  | "Launch Campaign"
  | "Social Content"
  | "Rolling Shots"
  | "Event Coverage";

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
  videoUrl?: string;
  uploadedVideo?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  behindTheScenes?: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type Service = {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
};

export type SiteSettings = {
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
    ogImage: string;
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
  };
  services: Service[];
};

export type InquiryServiceType =
  | "Commercial Shoot"
  | "Social Content"
  | "Motion Direction"
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
