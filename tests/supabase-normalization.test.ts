import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteSettings } from "../lib/site-config";
import {
  normalizeProjectRecord,
  normalizeSiteSettingsRecord,
  type SupabaseProjectRow,
  type SupabaseSiteSettingsRow
} from "../lib/supabase";

function projectRow(
  overrides: Partial<SupabaseProjectRow> = {}
): SupabaseProjectRow {
  return {
    id: "project-id",
    business: "Car",
    title: "Project",
    slug: "project",
    short_description: "Short",
    full_description: "Full",
    category: "Brand Film",
    car_model: "Model",
    location: "Zurich",
    year: 2026,
    cover_image: "/images/cover.jpg",
    gallery_images: ["/images/legacy.jpg"],
    gallery_captions: ["Legacy"],
    gallery_items: null,
    video_url: null,
    uploaded_video: null,
    featured: true,
    published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: null,
    behind_the_scenes: null,
    ...overrides
  };
}

function siteSettingsRow(
  overrides: Partial<SupabaseSiteSettingsRow> = {}
): SupabaseSiteSettingsRow {
  return {
    id: "global",
    updated_at: null,
    brand_name: null,
    brand_mark: null,
    brand_strapline: null,
    contact_email: null,
    contact_phone: null,
    contact_city: null,
    social_links: null,
    seo_title: null,
    seo_description: null,
    hero_eyebrow: null,
    hero_headline_lead: null,
    hero_headline_trail: null,
    hero_copy: null,
    hero_video_url: null,
    about_founder_note: null,
    about_positioning: null,
    about_team_images: null,
    about_team_members: null,
    about_values: null,
    services: null,
    selected_frames: null,
    motion_frames: null,
    navigation_visibility: null,
    site_copy: null,
    ...overrides
  };
}

test("normalizes legacy project rows and falls back to created_at", () => {
  const project = normalizeProjectRecord(projectRow());

  assert.equal(project.business, "Automotive");
  assert.equal(project.updatedAt, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(project.galleryImages, ["/images/legacy.jpg"]);
  assert.deepEqual(project.galleryCaptions, ["Legacy"]);
});

test("prefers structured project gallery items and removes cover duplicates", () => {
  const project = normalizeProjectRecord(
    projectRow({
      gallery_items: [
        {
          image: "/images/cover.jpg",
          caption: "Duplicate cover"
        },
        {
          image: " /images/structured.jpg ",
          caption: " Structured caption ",
          alt: " Structured alt "
        }
      ]
    })
  );

  assert.deepEqual(project.galleryImages, ["/images/structured.jpg"]);
  assert.deepEqual(project.galleryCaptions, ["Structured caption"]);
  assert.equal(project.galleryItems?.[0]?.alt, "Structured alt");
});

test("normalizes partial site settings with safe defaults and stable arrays", () => {
  const settings = normalizeSiteSettingsRecord(
    siteSettingsRow({
      brand_name: "  Custom Studio  ",
      social_links: [
        { label: " Instagram ", href: " https://instagram.com/lux " },
        { label: "", href: "https://invalid.example" }
      ],
      services: [
        {
          number: "99",
          title: "Film",
          description: "Production",
          deliverables: ["Hero"]
        },
        {
          number: "98",
          title: "Motion Direction",
          description: "Legacy",
          deliverables: []
        }
      ],
      selected_frames: [
        " /images/still.jpg | /work/project ",
        " ",
        "/images/second.jpg"
      ],
      motion_frames: []
    })
  );

  assert.equal(settings.brand.name, "Custom Studio");
  assert.deepEqual(settings.social, [
    { label: "Instagram", href: "https://instagram.com/lux" }
  ]);
  assert.deepEqual(settings.services, [
    {
      number: "01",
      title: "Film",
      description: "Production",
      deliverables: ["Hero"]
    }
  ]);
  assert.deepEqual(settings.selectedFrames, [
    "/images/still.jpg | /work/project",
    "/images/second.jpg"
  ]);
  assert.deepEqual(settings.motionFrames, []);
  assert.equal(settings.contact.email, defaultSiteSettings.contact.email);
});
