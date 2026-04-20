import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { projects as fallbackProjects } from "@/lib/content";
import { normalizeProjectBusiness } from "@/lib/project-business";
import { defaultSiteSettings } from "@/lib/site-config";
import type { Project, Service, SiteSettings, SocialLink } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "projects";
export const SITE_SETTINGS_ID = "global";

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

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

export function createServerSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false
    }
  });
}

type SupabaseProjectRow = {
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
  video_url: string | null;
  uploaded_video: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  behind_the_scenes: string | null;
};

type SupabaseSiteSettingsRow = {
  id: string;
  brand_name: string | null;
  brand_mark: string | null;
  brand_strapline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_city: string | null;
  social_links: SocialLink[] | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  hero_eyebrow: string | null;
  hero_headline_lead: string | null;
  hero_headline_trail: string | null;
  hero_copy: string | null;
  hero_video_url: string | null;
  about_founder_note: string | null;
  about_positioning: string | null;
  about_values: Array<{ title: string; copy: string }> | null;
  services: Service[] | null;
};

function normalizeSocialLinks(links: SocialLink[] | null | undefined) {
  if (!Array.isArray(links)) {
    return defaultSiteSettings.social;
  }

  return links
    .map((link) => ({
      label: link?.label?.trim() ?? "",
      href: link?.href?.trim() ?? ""
    }))
    .filter((link) => link.label && link.href);
}

export function normalizeProjectRecord(record: SupabaseProjectRow): Project {
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
    coverImage: record.cover_image,
    galleryImages: record.gallery_images ?? [],
    galleryCaptions: record.gallery_captions ?? [],
    videoUrl: record.video_url ?? undefined,
    uploadedVideo: record.uploaded_video ?? undefined,
    featured: record.featured,
    published: record.published,
    createdAt: record.created_at,
    behindTheScenes: record.behind_the_scenes ?? undefined
  };
}

export function normalizeSiteSettingsRecord(
  record: SupabaseSiteSettingsRow
): SiteSettings {
  return {
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
        record.seo_description?.trim() || defaultSiteSettings.seo.description,
      ogImage: record.seo_og_image?.trim() || defaultSiteSettings.seo.ogImage
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
      videoUrl:
        record.hero_video_url?.trim() || defaultSiteSettings.hero.videoUrl
    },
    about: {
      founderNote:
        record.about_founder_note?.trim() ||
        defaultSiteSettings.about.founderNote,
      positioning:
        record.about_positioning?.trim() ||
        defaultSiteSettings.about.positioning,
      values:
        Array.isArray(record.about_values) && record.about_values.length > 0
          ? record.about_values
          : defaultSiteSettings.about.values
    },
    services:
      Array.isArray(record.services) && record.services.length > 0
        ? record.services
        : defaultSiteSettings.services
  };
}

export const getPublishedProjects = cache(
  async function getPublishedProjects() {
    const client = createServerSupabaseClient();

    if (!client) {
      return fallbackProjects.filter((project) => project.published);
    }

    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return fallbackProjects.filter((project) => project.published);
    }

    return (data as SupabaseProjectRow[]).map(normalizeProjectRecord);
  }
);

export const getProjectBySlug = cache(async function getProjectBySlug(
  slug: string
) {
  const client = createServerSupabaseClient();

  if (!client) {
    return fallbackProjects.find((project) => project.slug === slug);
  }

  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    return fallbackProjects.find((project) => project.slug === slug);
  }

  return normalizeProjectRecord(data as SupabaseProjectRow);
});

// cache() deduplicates calls within the same request (generateMetadata + RootLayout)
export const getSiteSettings = cache(async function getSiteSettings() {
  const client = createServerSupabaseClient();

  if (!client) {
    return defaultSiteSettings;
  }

  const { data, error } = await client
    .from("site_settings")
    .select("*")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error || !data) {
    return defaultSiteSettings;
  }

  return normalizeSiteSettingsRecord(data as SupabaseSiteSettingsRow);
});
