import type {
  ProjectFormState,
  SiteSettingsFormState
} from "@/lib/admin-types";
import { createEmptyProject, parseMultilineInput } from "@/lib/admin-utils";
import { normalizeProjectGallery } from "@/lib/project-images";
import { projectBusinesses } from "@/lib/project-business";
import { SITE_SETTINGS_ID } from "@/lib/supabase";
import type { Project, TeamMember } from "@/lib/types";

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

const imageMimeTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
const imageExtensions = new Set(["avif", "gif", "jpeg", "jpg", "png", "webp"]);
const videoMimeTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const videoExtensions = new Set(["mov", "mp4", "webm"]);

type MediaFileLike = {
  name: string;
  size: number;
  type?: string;
};

/**
 * Returns files that violate the admin upload contract.
 *
 * Both MIME type and extension are checked because either value alone can be
 * misleading. Empty files and files above the image/video size limit are also
 * rejected.
 *
 * @param files - Browser `File` objects or file-like test values.
 * @param kind - Chooses the accepted formats and maximum size.
 * @returns Only invalid entries; an empty array means validation passed.
 */
export function getInvalidMediaFiles<T extends MediaFileLike>(
  files: T[],
  kind: "image" | "video"
) {
  const allowedMimeTypes = kind === "image" ? imageMimeTypes : videoMimeTypes;
  const allowedExtensions =
    kind === "image" ? imageExtensions : videoExtensions;
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

  return files.filter((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = file.type?.trim().toLowerCase() ?? "";

    return (
      file.size <= 0 ||
      file.size > maxBytes ||
      !allowedExtensions.has(extension) ||
      !mimeType ||
      !allowedMimeTypes.has(mimeType)
    );
  });
}

export type ProjectMediaState = {
  coverImage: string;
  galleryImages: string[];
  galleryCaptions: string[];
  uploadedVideo: string;
};

export type TeamMemberValidationIssue = {
  index: number;
  missing: Array<"name" | "portrait">;
};

/**
 * Finds the first partially completed team member before Site Settings save.
 *
 * Public team cards require both a name and a portrait. A queued portrait
 * counts as present even though its final Storage URL is only known during the
 * save operation.
 */
export function findIncompleteTeamMember(
  members: TeamMember[],
  queuedPortraitIndexes: number[] = []
): TeamMemberValidationIssue | null {
  const queuedIndexes = new Set(queuedPortraitIndexes);

  for (const [index, member] of members.entries()) {
    const name = member.name.trim();
    const hasPortrait =
      Boolean(member.image.trim()) || queuedIndexes.has(index);
    const hasContent =
      Boolean(name) ||
      Boolean(member.title.trim()) ||
      Boolean(member.position.trim()) ||
      Boolean(member.description.trim()) ||
      hasPortrait;

    if (!hasContent) continue;

    const missing: TeamMemberValidationIssue["missing"] = [];
    if (!name) missing.push("name");
    if (!hasPortrait) missing.push("portrait");

    if (missing.length > 0) {
      return { index, missing };
    }
  }

  return null;
}

/**
 * Validates and upgrades an unknown browser draft into current project form
 * state.
 *
 * Missing fields receive current defaults and unsupported business values fall
 * back safely. Invalid non-object input returns `null`.
 */
export function restoreProjectDraft(value: unknown): ProjectFormState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const draft = value as Partial<ProjectFormState>;
  const business = draft.business?.trim();

  return {
    ...createEmptyProject(),
    ...draft,
    business:
      business &&
      projectBusinesses.includes(business as (typeof projectBusinesses)[number])
        ? business
        : createEmptyProject().business
  };
}

export function getOversizedFiles<T extends { size: number }>(
  files: T[],
  maxBytes: number
) {
  return files.filter((file) => file.size > maxBytes);
}

/**
 * Produces one normalized media snapshot from form URLs and optional upload
 * results.
 *
 * The gallery normalizer removes blanks, duplicate images, and the cover image
 * while preserving caption alignment.
 *
 * @param formState - Current project form.
 * @param overrides - Newly uploaded URLs that should replace form values.
 * @returns Media ready for either the database or local demo project.
 */
export function getProjectMediaState(
  formState: ProjectFormState,
  overrides: Partial<ProjectMediaState> = {}
): ProjectMediaState {
  const gallery = normalizeProjectGallery({
    coverImage: overrides.coverImage ?? formState.coverImage,
    galleryImages:
      overrides.galleryImages ??
      parseMultilineInput(formState.galleryImagesText),
    galleryCaptions:
      overrides.galleryCaptions ??
      formState.galleryCaptionsText.split("\n").map((value) => value.trim())
  });

  return {
    coverImage: overrides.coverImage ?? formState.coverImage,
    galleryImages: gallery.images,
    galleryCaptions: gallery.captions,
    uploadedVideo: overrides.uploadedVideo ?? formState.uploadedVideo
  };
}

/**
 * Maps camelCase admin form state to the `projects` database row shape.
 *
 * Template projects intentionally omit `id`, causing the repository to insert
 * a new row instead of updating the permanent template. No I/O happens here.
 *
 * @returns A Supabase-ready payload using snake_case column names.
 */
export function buildProjectDatabasePayload({
  formState,
  slug,
  media,
  createdAt = new Date().toISOString()
}: {
  formState: ProjectFormState;
  slug: string;
  media: ProjectMediaState;
  createdAt?: string;
}) {
  const isTemplateSource = Boolean(formState.templateBusiness);

  return {
    id: isTemplateSource ? undefined : formState.id,
    business: formState.business,
    title: formState.title,
    slug,
    short_description: formState.shortDescription,
    full_description: formState.fullDescription,
    category: formState.category,
    car_model: formState.carModel || formState.category,
    location: formState.location,
    year: Number(formState.year),
    cover_image: media.coverImage,
    gallery_images: media.galleryImages,
    gallery_captions: media.galleryCaptions,
    gallery_items: media.galleryImages.map((image, index) => ({
      image,
      caption: media.galleryCaptions[index] ?? ""
    })),
    video_url: formState.videoUrl || null,
    uploaded_video: media.uploadedVideo || null,
    featured: formState.featured,
    published: formState.published,
    created_at: isTemplateSource ? createdAt : formState.createdAt,
    behind_the_scenes: formState.behindTheScenes || null
  };
}

/**
 * Builds the same logical project as the database path without performing I/O.
 *
 * This keeps demo mode behavior close to production and returns the public
 * camelCase `Project` representation rather than database column names.
 */
export function buildLocalProject({
  formState,
  slug,
  media,
  createdAt = new Date().toISOString()
}: {
  formState: ProjectFormState;
  slug: string;
  media: ProjectMediaState;
  createdAt?: string;
}): Project {
  const isTemplateSource = Boolean(formState.templateBusiness);

  return {
    id: isTemplateSource ? undefined : formState.id,
    business: formState.business,
    title: formState.title,
    slug,
    shortDescription: formState.shortDescription,
    fullDescription: formState.fullDescription,
    category: formState.category,
    carModel: formState.carModel || formState.category,
    location: formState.location,
    year: Number(formState.year),
    coverImage: media.coverImage,
    galleryImages: media.galleryImages,
    galleryCaptions: media.galleryCaptions,
    galleryItems: media.galleryImages.map((image, index) => ({
      image,
      caption: media.galleryCaptions[index] ?? ""
    })),
    videoUrl: formState.videoUrl || undefined,
    uploadedVideo: media.uploadedVideo || undefined,
    featured: formState.featured,
    published: formState.published,
    createdAt: isTemplateSource ? createdAt : formState.createdAt,
    updatedAt: isTemplateSource
      ? createdAt
      : (formState.updatedAt ?? formState.createdAt),
    behindTheScenes: formState.behindTheScenes || undefined
  };
}

/**
 * Maps Site Settings form state to the single `site_settings` database row.
 *
 * Nested editor values are trimmed and normalized here so UI components never
 * need to know the database's snake_case schema.
 */
export function buildSiteSettingsDatabasePayload(
  formState: SiteSettingsFormState
) {
  const teamMembers = normalizeTeamMembersForSave(formState.aboutTeamMembers);

  return {
    id: SITE_SETTINGS_ID,
    brand_name: formState.brandName,
    brand_mark: formState.brandMark,
    brand_strapline: formState.brandStrapline,
    contact_email: formState.contactEmail,
    contact_phone: formState.contactPhone,
    contact_city: formState.contactCity,
    social_links: formState.socialLinks
      .map((link) => ({
        label: link.label.trim(),
        href: link.href.trim()
      }))
      .filter((link) => link.label && link.href),
    seo_title: formState.seoTitle,
    seo_description: formState.seoDescription,
    hero_eyebrow: formState.heroEyebrow,
    hero_headline_lead: formState.heroHeadlineLead,
    hero_headline_trail: formState.heroHeadlineTrail,
    hero_copy: formState.heroCopy,
    hero_video_url: formState.heroVideoUrl,
    about_founder_note: formState.aboutFounderNote,
    about_positioning: formState.aboutPositioning,
    about_team_images: parseMultilineInput(formState.aboutTeamGalleryText),
    about_team_members: teamMembers,
    about_values: formState.aboutValues
      .map((value) => ({
        title: value.title.trim(),
        copy: value.copy.trim()
      }))
      .filter((value) => value.title || value.copy),
    services: formState.services
      .map((service, index) => ({
        number: service.number.trim() || String(index + 1).padStart(2, "0"),
        title: service.title.trim(),
        description: service.description.trim(),
        deliverables: service.deliverables
          .map((deliverable) => deliverable.trim())
          .filter(Boolean)
      }))
      .filter((service) => service.title),
    selected_frames: parseMultilineInput(formState.selectedFramesText),
    motion_frames: parseMultilineInput(formState.motionFramesText),
    navigation_visibility: {
      home: formState.navigationHome,
      work: formState.navigationWork,
      services: formState.navigationServices,
      about: formState.navigationAbout,
      contact: formState.navigationContact
    },
    site_copy: formState.copy
  };
}

function normalizeTeamMembersForSave(members: TeamMember[]) {
  return members
    .map((member) => ({
      name: member.name.trim(),
      title: member.title.trim(),
      position: member.position.trim(),
      description: member.description.trim(),
      image: member.image.trim()
    }))
    .filter((member) => member.name || member.image);
}
