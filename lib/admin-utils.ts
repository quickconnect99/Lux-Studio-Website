import type {
  Project,
  ProjectBusiness,
  ProjectCategory,
  Service,
  SiteSettings,
  SocialLink
} from "@/lib/types";
import type {
  CompletionContext,
  ProjectFormState,
  SiteSettingsFormState
} from "@/lib/admin-types";
import { projectBusinesses } from "@/lib/project-business";

export const DRAFT_STORAGE_KEY = "admin-project-draft";

export const categories: ProjectCategory[] = [
  "Brand Film",
  "Launch Campaign",
  "Social Content",
  "Rolling Shots",
  "Event Coverage"
];

export const businesses: ProjectBusiness[] = projectBusinesses;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseMultilineInput(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getProjectCompletionIssues(
  state: ProjectFormState,
  context: CompletionContext
): string[] {
  const issues: string[] = [];
  const year = Number(state.year);
  const galleryImages = parseMultilineInput(state.galleryImagesText);

  if (!state.title.trim()) issues.push("title");
  if (!state.slug.trim()) issues.push("slug");
  if (!state.shortDescription.trim()) issues.push("short description");
  if (!state.fullDescription.trim()) issues.push("full description");
  if (!state.carModel.trim()) issues.push("primary subject");
  if (!state.location.trim()) issues.push("location");
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    issues.push("valid year");
  }
  if (!state.coverImage.trim() && !context.hasQueuedCover) {
    issues.push("cover image");
  }
  if (galleryImages.length === 0 && context.queuedGalleryCount === 0) {
    issues.push("at least one gallery image");
  }

  return issues;
}

export function toFormState(project: Project): ProjectFormState {
  return {
    id: project.id,
    business: project.business,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    fullDescription: project.fullDescription,
    category: project.category,
    carModel: project.carModel,
    location: project.location,
    year: String(project.year),
    coverImage: project.coverImage,
    galleryImagesText: project.galleryImages.join("\n"),
    galleryCaptionsText: (project.galleryCaptions ?? []).join("\n"),
    videoUrl: project.videoUrl ?? "",
    uploadedVideo: project.uploadedVideo ?? "",
    featured: project.featured,
    published: project.published,
    createdAt: project.createdAt,
    behindTheScenes: project.behindTheScenes ?? ""
  };
}

export function formatSocialLinksText(links: SocialLink[]): string {
  return links.map((link) => `${link.label} | ${link.href}`).join("\n");
}

export function parseSocialLinksText(value: string): SocialLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|");
      return { label: label?.trim() ?? "", href: href?.trim() ?? "" };
    })
    .filter((link) => link.label && link.href);
}

export function formatValuesText(
  values: Array<{ title: string; copy: string }>
): string {
  return values.map((v) => `${v.title} | ${v.copy}`).join("\n");
}

export function parseValuesText(
  value: string
): Array<{ title: string; copy: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeIndex = line.indexOf("|");
      if (pipeIndex === -1) return { title: line, copy: "" };
      return {
        title: line.slice(0, pipeIndex).trim(),
        copy: line.slice(pipeIndex + 1).trim()
      };
    })
    .filter((v) => v.title);
}

export function formatServicesText(services: Service[]): string {
  return services
    .map(
      (s) =>
        `${s.number} | ${s.title} | ${s.description} | ${s.deliverables.join(", ")}`
    )
    .join("\n");
}

export function parseServicesText(value: string): Service[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|").map((p) => p.trim());
      const [number, title, description, deliverablesStr] = parts;
      return {
        number: number || String(index + 1).padStart(2, "0"),
        title: title ?? "",
        description: description ?? "",
        deliverables: deliverablesStr
          ? deliverablesStr
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)
          : []
      };
    })
    .filter((s) => s.title);
}

export function toSiteSettingsFormState(
  settings: SiteSettings
): SiteSettingsFormState {
  return {
    brandName: settings.brand.name,
    brandMark: settings.brand.mark,
    brandStrapline: settings.brand.strapline,
    contactEmail: settings.contact.email,
    contactPhone: settings.contact.phone,
    contactCity: settings.contact.city,
    socialLinksText: formatSocialLinksText(settings.social),
    seoTitle: settings.seo.title,
    seoDescription: settings.seo.description,
    seoOgImage: settings.seo.ogImage,
    heroEyebrow: settings.hero.eyebrow,
    heroHeadlineLead: settings.hero.headlineLead,
    heroHeadlineTrail: settings.hero.headlineTrail,
    heroCopy: settings.hero.copy,
    heroVideoUrl: settings.hero.videoUrl,
    aboutFounderNote: settings.about.founderNote,
    aboutPositioning: settings.about.positioning,
    aboutValuesText: formatValuesText(settings.about.values),
    servicesText: formatServicesText(settings.services)
  };
}

export function createEmptyProject(): ProjectFormState {
  return {
    business: "Car",
    title: "New Project",
    slug: "new-project",
    shortDescription: "",
    fullDescription: "",
    category: "Brand Film",
    carModel: "",
    location: "",
    year: String(new Date().getFullYear()),
    coverImage: "/images/project-01.svg",
    galleryImagesText: "",
    galleryCaptionsText: "",
    videoUrl: "",
    uploadedVideo: "",
    featured: false,
    published: false,
    createdAt: new Date().toISOString(),
    behindTheScenes: ""
  };
}
