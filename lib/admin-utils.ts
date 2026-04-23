import type {
  Project,
  ProjectBusiness,
  ProjectCategory,
  Service,
  SiteSettings,
  SocialLink
} from "@/lib/types";
import type {
  AdminProjectListItem,
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

const currentYear = new Date().getFullYear();

export function getAdminProjectKey(project: {
  id?: string;
  slug: string;
  isTemplate?: boolean;
  templateBusiness?: ProjectBusiness;
}) {
  if (project.isTemplate && project.templateBusiness) {
    return `template:${project.templateBusiness.toLowerCase()}`;
  }

  return `project:${project.id ?? project.slug}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildUniqueSlugSuggestion(
  value: string,
  existingSlugs: string[],
  fallback = "project"
) {
  const baseSlug = slugify(value) || fallback;
  const seen = new Set(existingSlugs);

  if (!seen.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (seen.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
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

export function toFormState(project: Project & {
  isTemplate?: boolean;
  templateBusiness?: ProjectBusiness;
}): ProjectFormState {
  return {
    id: project.id,
    templateBusiness: project.isTemplate ? project.templateBusiness : undefined,
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

export function toAdminProjectListItem(project: Project): AdminProjectListItem {
  return {
    ...project,
    adminKey: getAdminProjectKey(project)
  };
}

export function createProjectTemplate(
  business: ProjectBusiness
): AdminProjectListItem {
  const base =
    business === "Car"
      ? {
          title: "Car Project Template",
          shortDescription:
            "Replace this with a concise one-line summary for the automotive project.",
          fullDescription:
            "Use this template to outline the shoot, campaign angle, deliverables, and how the visual system should feel across stills, motion, and rollout placements.",
          category: "Brand Film" as const,
          carModel: "Brand / Model",
          location: "City",
          year: currentYear,
          coverImage: "/images/demo-car-01.jpg",
          galleryImages: ["/images/demo-car-02.jpg"],
          galleryCaptions: [
            "Starter gallery frame for the automotive template. Replace with the first supporting still."
          ]
        }
      : {
          title: "Hospitality Project Template",
          shortDescription:
            "Replace this with a concise one-line summary for the hospitality project.",
          fullDescription:
            "Use this template to define the property story, atmosphere, guest journey, deliverables, and the role of stills, motion, and rollout assets.",
          category: "Launch Campaign" as const,
          carModel: "Property / Venue",
          location: "City",
          year: currentYear,
          coverImage: "/images/hospitality/quiet-arrival-cover.svg",
          galleryImages: ["/images/hospitality/quiet-arrival-frame.svg"],
          galleryCaptions: [
            "Starter gallery frame for the hospitality template. Replace with the first supporting still."
          ]
        };

  return {
    business,
    slug: `${business.toLowerCase()}-project-template`,
    featured: false,
    published: false,
    createdAt: new Date(currentYear, 0, 1).toISOString(),
    behindTheScenes: "",
    videoUrl: "",
    uploadedVideo: "",
    isTemplate: true,
    templateBusiness: business,
    adminKey: getAdminProjectKey({
      slug: `${business.toLowerCase()}-project-template`,
      isTemplate: true,
      templateBusiness: business
    }),
    ...base
  };
}

export const projectTemplates: AdminProjectListItem[] = [
  createProjectTemplate("Car"),
  createProjectTemplate("Hospitality")
];

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
    templateBusiness: undefined,
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
