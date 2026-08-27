import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { projects as fallbackProjects } from "@/lib/content";
import {
  filterPublicMediaUrls,
  normalizePublicMediaUrl
} from "@/lib/media-url";
import { normalizeProjectBusiness } from "@/lib/project-business";
import { normalizeProjectGallery } from "@/lib/project-images";
import { DEFAULT_PROJECT_IMAGE, defaultSiteSettings } from "@/lib/site-config";
import type {
  NavigationVisibility,
  Project,
  Service,
  SiteCopy,
  SiteSettings,
  SocialLink,
  TeamMember
} from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "projects";
export const SITE_SETTINGS_ID = "global";

// Keep public reads explicit. Besides reducing accidental payload growth, this
// prevents a future internal column from becoming part of the browser-facing
// anon query merely because it was added to the base table.
export const PUBLIC_PROJECT_COLUMNS =
  "id,business,title,slug,short_description,full_description,category,car_model,location,year,cover_image,gallery_images,gallery_captions,gallery_items,video_url,uploaded_video,featured,published,created_at,updated_at,behind_the_scenes";

export const PUBLIC_SITE_SETTINGS_COLUMNS =
  "id,updated_at,brand_name,brand_mark,brand_strapline,contact_email,contact_phone,contact_city,social_links,seo_title,seo_description,hero_eyebrow,hero_headline_lead,hero_headline_trail,hero_copy,hero_video_url,about_founder_note,about_positioning,about_team_images,about_team_members,about_values,services,selected_frames,motion_frames,navigation_visibility,site_copy";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Build-time / runtime env check.
// Logs a clear warning so misconfigured deployments are easy to diagnose.
// Only checks when at least one var is set to avoid noise in demo mode.
if (
  typeof window === "undefined" &&
  (supabaseUrl || supabaseAnonKey) &&
  !isSupabaseConfigured
) {
  console.warn(
    "[supabase] Partial configuration detected.\n" +
      "  NEXT_PUBLIC_SUPABASE_URL:      " +
      (supabaseUrl ? "✓ set" : "✗ missing") +
      "\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY: " +
      (supabaseAnonKey ? "✓ set" : "✗ missing") +
      "\n" +
      "  Both variables must be set to enable Supabase. " +
      "Falling back to demo content."
  );
}

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Returns the singleton browser client used for auth and admin mutations.
 *
 * `null` means Supabase is intentionally unavailable and callers should use
 * the documented demo path. Reusing one browser instance also reuses its auth
 * session and subscription state.
 */
export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

/**
 * Creates a stateless server client for public reads.
 *
 * Server fetches use a five-minute cache fallback. Successful admin saves call
 * the protected revalidation route so visitors normally see changes
 * immediately.
 */
export function createServerSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false
    },
    global: {
      // Cached for up to 5 minutes; the admin dashboard forces an immediate
      // refresh on save via /api/admin/revalidate, so this window is only a
      // fallback (e.g. if that call fails) rather than the normal path.
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: 300 }
        })
    }
  });
}

// Deliberately wider than `Database["public"]["Tables"]["projects"]["Row"]`:
// this is the untrusted-input boundary for `normalizeProjectRecord`, which
// must tolerate legacy or malformed rows (nulls where the schema now says
// `not null`, missing `gallery_items`) rather than assume the generated
// schema types describe every row already in the database.
export type SupabaseProjectRow = {
  id?: string;
  business?: string | null;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  category: Project["category"];
  car_model: string;
  location: string;
  year: number;
  cover_image: string;
  gallery_images: string[] | null;
  gallery_captions: string[] | null;
  gallery_items?: Array<{
    image?: string | null;
    caption?: string | null;
    alt?: string | null;
  }> | null;
  video_url: string | null;
  uploaded_video: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at?: string | null;
  behind_the_scenes: string | null;
};

export type SupabaseSiteSettingsRow = {
  id: string;
  updated_at?: string | null;
  brand_name: string | null;
  brand_mark: string | null;
  brand_strapline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_city: string | null;
  social_links: SocialLink[] | null;
  seo_title: string | null;
  seo_description: string | null;
  hero_eyebrow: string | null;
  hero_headline_lead: string | null;
  hero_headline_trail: string | null;
  hero_copy: string | null;
  hero_video_url: string | null;
  about_founder_note: string | null;
  about_positioning: string | null;
  about_team_images: string[] | null;
  about_team_members: TeamMember[] | null;
  about_values: Array<{ title: string; copy: string }> | null;
  services: Service[] | null;
  selected_frames: string[] | null;
  motion_frames?: string[] | null;
  navigation_visibility: Partial<NavigationVisibility> | null;
  site_copy: Partial<SiteCopy> | null;
};

function normalizePublicHttpUrl(value: unknown) {
  if (typeof value !== "string") return "";

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSocialLinks(links: unknown) {
  if (!Array.isArray(links)) {
    return defaultSiteSettings.social;
  }

  return links
    .map((link) => ({
      label:
        link &&
        typeof link === "object" &&
        "label" in link &&
        typeof link.label === "string"
          ? link.label.trim()
          : "",
      href:
        link && typeof link === "object" && "href" in link
          ? normalizePublicHttpUrl(link.href)
          : ""
    }))
    .filter((link) => link.label && link.href);
}

function normalizeNavigationVisibility(
  visibility: unknown
): NavigationVisibility {
  const fallback = defaultSiteSettings.navigation;
  const source = isRecord(visibility) ? visibility : {};

  const normalizeFlag = (key: keyof NavigationVisibility) =>
    typeof source[key] === "boolean" ? source[key] : fallback[key];

  return {
    home: normalizeFlag("home"),
    work: normalizeFlag("work"),
    services: normalizeFlag("services"),
    about: normalizeFlag("about"),
    contact: normalizeFlag("contact")
  };
}

function normalizeCopySection<Section extends object>(
  value: unknown,
  fallback: Section
) {
  const source = isRecord(value) ? value : {};

  return Object.fromEntries(
    Object.entries(fallback).map(([key, fallbackValue]) => [
      key,
      typeof source[key] === "string" ? source[key] : fallbackValue
    ])
  ) as Section;
}

function normalizeSiteCopy(copy: unknown): SiteCopy {
  const fallback = defaultSiteSettings.copy;
  const source = isRecord(copy) ? copy : {};

  return {
    home: normalizeCopySection(source.home, fallback.home),
    work: normalizeCopySection(source.work, fallback.work),
    services: normalizeCopySection(source.services, fallback.services),
    about: normalizeCopySection(source.about, fallback.about),
    contact: normalizeCopySection(source.contact, fallback.contact),
    footer: normalizeCopySection(source.footer, fallback.footer)
  };
}

function normalizeServices(services: unknown) {
  const source =
    Array.isArray(services) && services.length > 0
      ? services
      : defaultSiteSettings.services;

  const normalized = source.flatMap((service) => {
    if (!service || typeof service !== "object") return [];

    const record = service as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const description =
      typeof record.description === "string" ? record.description.trim() : "";
    const deliverables = Array.isArray(record.deliverables)
      ? record.deliverables
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    return title && description ? [{ title, description, deliverables }] : [];
  });

  return normalized.map((service, index) => ({
    ...service,
    number: String(index + 1).padStart(2, "0")
  }));
}

function normalizeSelectedFrames(frames: unknown) {
  if (!Array.isArray(frames)) {
    return defaultSiteSettings.selectedFrames;
  }

  return frames
    .filter((frame): frame is string => typeof frame === "string")
    .map((frame) => frame.trim())
    .filter(Boolean);
}

/** Normalizes optional CMS motion frames while retaining configured defaults. */
export function normalizeMotionFrames(frames: unknown) {
  if (!Array.isArray(frames)) {
    return defaultSiteSettings.motionFrames;
  }

  return frames
    .filter((frame): frame is string => typeof frame === "string")
    .map((frame) => frame.trim())
    .filter(Boolean);
}

function normalizeTeamMembers(members: unknown, legacyImages: unknown) {
  if (Array.isArray(members) && members.length > 0) {
    const normalized = members.flatMap((member) => {
      if (!isRecord(member)) return [];

      const text = (key: keyof TeamMember) =>
        typeof member[key] === "string" ? member[key].trim() : "";
      const normalizedMember = {
        name: text("name"),
        title: text("title"),
        position: text("position"),
        description: text("description"),
        image: normalizePublicMediaUrl(member.image)
      };

      return normalizedMember.name && normalizedMember.image
        ? [normalizedMember]
        : [];
    });

    if (normalized.length > 0) {
      return normalized;
    }
  }

  const legacy = filterPublicMediaUrls(legacyImages);

  return defaultSiteSettings.about.teamMembers.map((member, index) => ({
    ...member,
    image: legacy[index] ?? member.image
  }));
}

function normalizeAboutValues(values: unknown) {
  if (!Array.isArray(values) || values.length === 0) {
    return defaultSiteSettings.about.values;
  }

  const normalized = values.flatMap((value) => {
    if (!isRecord(value)) return [];

    const title = typeof value.title === "string" ? value.title.trim() : "";
    const copy = typeof value.copy === "string" ? value.copy.trim() : "";
    return title && copy ? [{ title, copy }] : [];
  });

  return normalized.length > 0 ? normalized : defaultSiteSettings.about.values;
}

/**
 * Converts a snake_case `projects` row into the public `Project` model.
 *
 * The normalizer also sanitizes media URLs, supports the legacy parallel
 * gallery arrays, prefers structured gallery items when available, and keeps
 * captions aligned after duplicate removal.
 */
export function normalizeProjectRecord(record: SupabaseProjectRow): Project {
  const legacyGallery = normalizeProjectGallery({
    coverImage: record.cover_image,
    galleryImages: filterPublicMediaUrls(record.gallery_images),
    galleryCaptions: Array.isArray(record.gallery_captions)
      ? record.gallery_captions.map((caption) =>
          typeof caption === "string" ? caption : ""
        )
      : []
  });
  const rawStructuredGallery = Array.isArray(record.gallery_items)
    ? record.gallery_items.flatMap((item) => {
        if (!isRecord(item)) return [];

        const image = normalizePublicMediaUrl(item.image);
        if (!image) return [];

        return [
          {
            image,
            caption:
              typeof item.caption === "string" ? item.caption.trim() : "",
            alt: typeof item.alt === "string" ? item.alt.trim() : ""
          }
        ];
      })
    : [];
  const structuredGallery = normalizeProjectGallery({
    coverImage: record.cover_image,
    galleryImages: rawStructuredGallery.map((item) => item.image),
    galleryCaptions: rawStructuredGallery.map((item) => item.caption),
    galleryAlts: rawStructuredGallery.map((item) => item.alt)
  }).items;
  const galleryItems =
    structuredGallery.length > 0 ? structuredGallery : legacyGallery.items;

  return {
    id: record.id,
    business: normalizeProjectBusiness(record.business),
    title: record.title,
    slug: record.slug,
    shortDescription: record.short_description,
    fullDescription: record.full_description,
    category: record.category,
    carModel: record.car_model,
    location: record.location,
    year: record.year,
    coverImage: normalizePublicMediaUrl(
      record.cover_image,
      DEFAULT_PROJECT_IMAGE
    ),
    galleryImages: galleryItems.map((item) => item.image),
    galleryCaptions: galleryItems.map((item) => item.caption),
    galleryItems,
    videoUrl: normalizePublicMediaUrl(record.video_url) || undefined,
    uploadedVideo: normalizePublicMediaUrl(record.uploaded_video) || undefined,
    featured: record.featured,
    published: record.published,
    createdAt: record.created_at,
    updatedAt: record.updated_at ?? record.created_at,
    behindTheScenes: record.behind_the_scenes ?? undefined
  };
}

/**
 * Converts the singleton Site Settings row into a complete public model.
 *
 * Missing or legacy values are filled from `defaultSiteSettings`, allowing
 * older databases to remain readable while migrations are rolled out.
 */
export function normalizeSiteSettingsRecord(
  record: SupabaseSiteSettingsRow
): SiteSettings {
  return {
    updatedAt: record.updated_at ?? defaultSiteSettings.updatedAt,
    brand: {
      name: record.brand_name?.trim() || defaultSiteSettings.brand.name,
      mark: record.brand_mark?.trim() || defaultSiteSettings.brand.mark,
      strapline:
        record.brand_strapline?.trim() || defaultSiteSettings.brand.strapline
    },
    contact: {
      email: record.contact_email?.trim() || defaultSiteSettings.contact.email,
      phone: record.contact_phone?.trim() || defaultSiteSettings.contact.phone,
      city: record.contact_city?.trim() || defaultSiteSettings.contact.city
    },
    social: normalizeSocialLinks(record.social_links),
    seo: {
      title: record.seo_title?.trim() || defaultSiteSettings.seo.title,
      description:
        record.seo_description?.trim() || defaultSiteSettings.seo.description
    },
    hero: {
      eyebrow: record.hero_eyebrow?.trim() || defaultSiteSettings.hero.eyebrow,
      headlineLead:
        record.hero_headline_lead?.trim() ||
        defaultSiteSettings.hero.headlineLead,
      headlineTrail:
        record.hero_headline_trail?.trim() ||
        defaultSiteSettings.hero.headlineTrail,
      copy: record.hero_copy?.trim() || defaultSiteSettings.hero.copy,
      videoUrl: normalizePublicMediaUrl(
        record.hero_video_url,
        defaultSiteSettings.hero.videoUrl
      )
    },
    about: {
      founderNote:
        record.about_founder_note?.trim() ||
        defaultSiteSettings.about.founderNote,
      positioning:
        record.about_positioning?.trim() ||
        defaultSiteSettings.about.positioning,
      teamMembers: normalizeTeamMembers(
        record.about_team_members,
        record.about_team_images
      ),
      teamGallery: filterPublicMediaUrls(record.about_team_images),
      values: normalizeAboutValues(record.about_values)
    },
    services: normalizeServices(record.services),
    selectedFrames: normalizeSelectedFrames(record.selected_frames),
    motionFrames: normalizeMotionFrames(record.motion_frames),
    navigation: normalizeNavigationVisibility(record.navigation_visibility),
    copy: normalizeSiteCopy(record.site_copy)
  };
}

/**
 * Loads all published projects for public pages.
 *
 * React `cache()` makes a layout and page in the same server request share one
 * Supabase round-trip. Demo content is used only when Supabase is not
 * configured; a configured but failing backend throws for the error boundary.
 */
export const getPublishedProjects = cache(async () => {
  const client = createServerSupabaseClient();

  if (!client) {
    return fallbackProjects.filter((project) => project.published);
  }

  const { data, error } = await client
    .from("projects_public")
    .select(PUBLIC_PROJECT_COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[supabase] Failed to load published projects", error);
    throw new Error("Published projects are temporarily unavailable.", {
      cause: error
    });
  }

  if (!data) {
    return [];
  }

  return (data as SupabaseProjectRow[]).map(normalizeProjectRecord);
});

/**
 * Loads one published project by slug.
 *
 * Unpublished and missing rows return `undefined`; backend errors throw so they
 * are not incorrectly presented as a normal 404.
 */
export const getProjectBySlug = cache(async (slug: string) => {
  const client = createServerSupabaseClient();

  if (!client) {
    return fallbackProjects.find((project) => project.slug === slug);
  }

  const { data, error } = await client
    .from("projects_public")
    .select(PUBLIC_PROJECT_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error(`[supabase] Failed to load project "${slug}"`, error);
    throw new Error("This project is temporarily unavailable.", {
      cause: error
    });
  }

  if (!data) {
    return undefined;
  }

  return normalizeProjectRecord(data as SupabaseProjectRow);
});

/**
 * Loads global Site Settings or returns defaults when the singleton row does
 * not yet exist.
 *
 * Like project reads, this is request-deduplicated through React `cache()`.
 */
export const getSiteSettings = cache(async () => {
  const client = createServerSupabaseClient();

  if (!client) {
    return defaultSiteSettings;
  }

  const { data, error } = await client
    .from("site_settings_public")
    .select(PUBLIC_SITE_SETTINGS_COLUMNS)
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    console.error("[supabase] Failed to load site settings", error);
    throw new Error("Site settings are temporarily unavailable.", {
      cause: error
    });
  }

  if (!data) {
    return defaultSiteSettings;
  }

  return normalizeSiteSettingsRecord(data as SupabaseSiteSettingsRow);
});
