import type {
  ProjectFormState,
  SiteSettingsFormState
} from "@/lib/admin-types";
import {
  createEmptyProject,
  parseMultilineInput,
  parseServicesText,
  parseSocialLinksText,
  parseValuesText
} from "@/lib/admin-utils";
import { normalizeProjectGallery } from "@/lib/project-images";
import { projectBusinesses } from "@/lib/project-business";
import { SITE_SETTINGS_ID } from "@/lib/supabase";
import type { Project, TeamMember } from "@/lib/types";

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

export type ProjectMediaState = {
  coverImage: string;
  galleryImages: string[];
  galleryCaptions: string[];
  uploadedVideo: string;
};

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
    video_url: formState.videoUrl || null,
    uploaded_video: media.uploadedVideo || null,
    featured: formState.featured,
    published: formState.published,
    created_at: isTemplateSource ? createdAt : formState.createdAt,
    behind_the_scenes: formState.behindTheScenes || null
  };
}

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
    videoUrl: formState.videoUrl || undefined,
    uploadedVideo: media.uploadedVideo || undefined,
    featured: formState.featured,
    published: formState.published,
    createdAt: isTemplateSource ? createdAt : formState.createdAt,
    behindTheScenes: formState.behindTheScenes || undefined
  };
}

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
    social_links: parseSocialLinksText(formState.socialLinksText),
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
    about_values: parseValuesText(formState.aboutValuesText),
    services: parseServicesText(formState.servicesText),
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
