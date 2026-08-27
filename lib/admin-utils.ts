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
import { DEFAULT_PROJECT_IMAGE } from "@/lib/site-config";

export const DRAFT_STORAGE_KEY = "admin-project-draft";

export const categories: ProjectCategory[] = [
  "Brand Film",
  "Launch Campaign",
  "Social Content",
  "Event Coverage",
  "Editorial",
  "Opening Campaign"
];

export const businesses: ProjectBusiness[] = projectBusinesses;

const currentYear = new Date().getFullYear();

/** Returns the stable React/admin identity for a template or persisted project. */
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

/**
 * Converts a human title into the lowercase, ASCII URL segment used by project
 * routes and database uniqueness checks.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Appends the first available numeric suffix when a slug is already taken. */
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

/**
 * Lists missing or invalid fields that block a project save.
 *
 * Queued local files count as media even though their public URLs do not exist
 * until the save workflow uploads them.
 */
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
  if (!state.category.trim()) issues.push("category");
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

/**
 * Converts a public project into the string-friendly state used by form
 * controls. Parallel gallery text keeps blank caption positions intact.
 */
export function toFormState(
  project: Project & {
    isTemplate?: boolean;
    templateBusiness?: ProjectBusiness;
  }
): ProjectFormState {
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
    galleryAltsText: (project.galleryItems ?? [])
      .map((item) => item.alt ?? "")
      .join("\n"),
    videoUrl: project.videoUrl ?? "",
    uploadedVideo: project.uploadedVideo ?? "",
    featured: project.featured,
    published: project.published,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    behindTheScenes: project.behindTheScenes ?? ""
  };
}

export function toAdminProjectListItem(project: Project): AdminProjectListItem {
  return {
    ...project,
    adminKey: getAdminProjectKey(project)
  };
}

/**
 * Creates an immutable starter project for one business line.
 *
 * Templates have stable admin keys but no database ID; saving one therefore
 * creates a new project instead of modifying the template.
 */
export function createProjectTemplate(
  business: ProjectBusiness
): AdminProjectListItem {
  const base =
    business.toLowerCase().includes("auto") || business === "Car"
      ? {
          title: "Car Project Template",
          shortDescription:
            "Replace this with a concise one-line summary for the automotive project.",
          fullDescription:
            "Use this template to outline the shoot, campaign angle, deliverables, and how the visual system should feel across stills, motion, and rollout placements.",
          category: "Brand Film" as const,
          carModel: "Brand Film",
          location: "City",
          year: currentYear,
          coverImage: DEFAULT_PROJECT_IMAGE,
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
          carModel: "Launch Campaign",
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
  createProjectTemplate("Automotive"),
  createProjectTemplate("Hospitality")
];

function escapeDelimitedValue(value: string, delimiter: string) {
  return value.replace(/\\/g, "\\\\").replaceAll(delimiter, `\\${delimiter}`);
}

function splitEscaped(value: string, delimiter: string) {
  const parts: string[] = [];
  let current = "";

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];

    if (character === "\\" && (next === delimiter || next === "\\")) {
      current += next;
      index += 1;
    } else if (character === delimiter) {
      parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  parts.push(current);
  return parts;
}

export function formatSocialLinksText(links: SocialLink[]): string {
  return links
    .map(
      (link) =>
        `${escapeDelimitedValue(link.label, "|")} | ${escapeDelimitedValue(link.href, "|")}`
    )
    .join("\n");
}

export function parseSocialLinksText(value: string): SocialLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = splitEscaped(line, "|");
      return { label: label?.trim() ?? "", href: href?.trim() ?? "" };
    })
    .filter((link) => link.label && link.href);
}

export function formatValuesText(
  values: Array<{ title: string; copy: string }>
): string {
  return values
    .map(
      (value) =>
        `${escapeDelimitedValue(value.title, "|")} | ${escapeDelimitedValue(value.copy, "|")}`
    )
    .join("\n");
}

export function parseValuesText(
  value: string
): Array<{ title: string; copy: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...copyParts] = splitEscaped(line, "|");
      return {
        title: title.trim(),
        copy: copyParts.join("|").trim()
      };
    })
    .filter((v) => v.title);
}

export function formatServicesText(services: Service[]): string {
  return services
    .map(
      (s) =>
        `${escapeDelimitedValue(s.number, "|")} | ${escapeDelimitedValue(s.title, "|")} | ${escapeDelimitedValue(s.description, "|")} | ${escapeDelimitedValue(s.deliverables.join(", "), "|")}`
    )
    .join("\n");
}

export function parseServicesText(value: string): Service[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = splitEscaped(line, "|").map((part) => part.trim());
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

/**
 * Deep-copies public Site Settings into editable form state.
 *
 * Copies prevent an input mutation from changing the last saved public object,
 * which would make Dirty State comparisons unreliable.
 */
export function toSiteSettingsFormState(
  settings: SiteSettings
): SiteSettingsFormState {
  return {
    updatedAt: settings.updatedAt,
    brandName: settings.brand.name,
    brandMark: settings.brand.mark,
    brandStrapline: settings.brand.strapline,
    contactEmail: settings.contact.email,
    contactPhone: settings.contact.phone,
    contactCity: settings.contact.city,
    socialLinks: settings.social.map((link) => ({ ...link })),
    seoTitle: settings.seo.title,
    seoDescription: settings.seo.description,
    heroEyebrow: settings.hero.eyebrow,
    heroHeadlineLead: settings.hero.headlineLead,
    heroHeadlineTrail: settings.hero.headlineTrail,
    heroCopy: settings.hero.copy,
    heroVideoUrl: settings.hero.videoUrl,
    aboutFounderNote: settings.about.founderNote,
    aboutPositioning: settings.about.positioning,
    aboutTeamMembers: settings.about.teamMembers,
    aboutTeamGalleryText: settings.about.teamGallery.join("\n"),
    aboutValues: settings.about.values.map((value) => ({ ...value })),
    services: settings.services.map((service) => ({
      ...service,
      deliverables: [...service.deliverables]
    })),
    selectedFramesText: settings.selectedFrames.join("\n"),
    motionFramesText: settings.motionFrames.join("\n"),
    navigationHome: settings.navigation.home,
    navigationWork: settings.navigation.work,
    navigationServices: settings.navigation.services,
    navigationAbout: settings.navigation.about,
    navigationContact: settings.navigation.contact,
    copy: settings.copy
  };
}

/** Returns safe defaults for a brand-new unpublished project draft. */
export function createEmptyProject(): ProjectFormState {
  return {
    templateBusiness: undefined,
    business: "Automotive",
    title: "New Project",
    slug: "new-project",
    shortDescription: "",
    fullDescription: "",
    category: "Brand Film",
    carModel: "Brand Film",
    location: "",
    year: String(new Date().getFullYear()),
    coverImage: "/images/project-01.svg",
    galleryImagesText: "",
    galleryCaptionsText: "",
    galleryAltsText: "",
    videoUrl: "",
    uploadedVideo: "",
    featured: false,
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
    behindTheScenes: ""
  };
}
