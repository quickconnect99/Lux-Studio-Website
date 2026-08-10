import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteSettings } from "../lib/site-config";
import {
  normalizeProjectRecord,
  normalizeSiteSettingsRecord,
  PUBLIC_PROJECT_COLUMNS,
  PUBLIC_SITE_SETTINGS_COLUMNS,
  type SupabaseProjectRow,
  type SupabaseSiteSettingsRow
} from "../lib/supabase";

test("public Supabase reads use explicit column allowlists", () => {
  assert.deepEqual(PUBLIC_PROJECT_COLUMNS.split(","), [
    "id",
    "business",
    "title",
    "slug",
    "short_description",
    "full_description",
    "category",
    "car_model",
    "location",
    "year",
    "cover_image",
    "gallery_images",
    "gallery_captions",
    "gallery_items",
    "video_url",
    "uploaded_video",
    "featured",
    "published",
    "created_at",
    "updated_at",
    "behind_the_scenes"
  ]);
  assert.deepEqual(PUBLIC_SITE_SETTINGS_COLUMNS.split(","), [
    "id",
    "updated_at",
    "brand_name",
    "brand_mark",
    "brand_strapline",
    "contact_email",
    "contact_phone",
    "contact_city",
    "social_links",
    "seo_title",
    "seo_description",
    "hero_eyebrow",
    "hero_headline_lead",
    "hero_headline_trail",
    "hero_copy",
    "hero_video_url",
    "about_founder_note",
    "about_positioning",
    "about_team_images",
    "about_team_members",
    "about_values",
    "services",
    "selected_frames",
    "motion_frames",
    "navigation_visibility",
    "site_copy"
  ]);
});

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
        { label: "", href: "https://invalid.example" },
        { label: "Unsafe", href: "javascript:alert(1)" }
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
    },
    {
      number: "02",
      title: "Motion Direction",
      description: "Legacy",
      deliverables: []
    }
  ]);
  assert.deepEqual(settings.selectedFrames, [
    "/images/still.jpg | /work/project",
    "/images/second.jpg"
  ]);
  assert.deepEqual(settings.motionFrames, []);
  assert.equal(settings.contact.email, defaultSiteSettings.contact.email);
});

test("ignores malformed CMS service entries without crashing public pages", () => {
  const settings = normalizeSiteSettingsRecord(
    siteSettingsRow({
      services: [
        null,
        { title: 42 },
        {
          title: "  Photography  ",
          description: "  Campaign stills  ",
          deliverables: ["  Hero selects  ", 12, ""]
        }
      ] as unknown as SupabaseSiteSettingsRow["services"]
    })
  );

  assert.deepEqual(settings.services, [
    {
      number: "01",
      title: "Photography",
      description: "Campaign stills",
      deliverables: ["Hero selects"]
    }
  ]);
});

test("normalizes malformed JSON settings fields at the public boundary", () => {
  const settings = normalizeSiteSettingsRecord(
    siteSettingsRow({
      about_team_members: [
        null,
        { name: 42, image: "/images/invalid.jpg" },
        {
          name: "  Producer  ",
          title: 99,
          position: "  Production  ",
          description: "  Coordinates the set  ",
          image: " /images/producer.jpg "
        }
      ] as unknown as SupabaseSiteSettingsRow["about_team_members"],
      about_values: [
        { title: 42, copy: "Invalid" },
        { title: "  Craft  ", copy: "  Details matter.  " }
      ] as unknown as SupabaseSiteSettingsRow["about_values"],
      selected_frames: [42, " /images/still.jpg "] as unknown as string[],
      motion_frames: [{}, " /images/motion.jpg "] as unknown as string[],
      navigation_visibility: {
        home: "yes",
        work: false
      } as unknown as SupabaseSiteSettingsRow["navigation_visibility"],
      site_copy: {
        home: {
          selectedWorkLabel: "Curated work",
          heroPrimaryCta: 42
        },
        footer: "invalid"
      } as unknown as SupabaseSiteSettingsRow["site_copy"]
    })
  );

  assert.deepEqual(settings.about.teamMembers, [
    {
      name: "Producer",
      title: "",
      position: "Production",
      description: "Coordinates the set",
      image: "/images/producer.jpg"
    }
  ]);
  assert.deepEqual(settings.about.values, [
    { title: "Craft", copy: "Details matter." }
  ]);
  assert.deepEqual(settings.selectedFrames, ["/images/still.jpg"]);
  assert.deepEqual(settings.motionFrames, ["/images/motion.jpg"]);
  assert.equal(settings.navigation.home, defaultSiteSettings.navigation.home);
  assert.equal(settings.navigation.work, false);
  assert.equal(settings.copy.home.selectedWorkLabel, "Curated work");
  assert.equal(
    settings.copy.home.heroPrimaryCta,
    defaultSiteSettings.copy.home.heroPrimaryCta
  );
  assert.deepEqual(settings.copy.footer, defaultSiteSettings.copy.footer);
});

test("ignores malformed structured project gallery values", () => {
  const project = normalizeProjectRecord(
    projectRow({
      gallery_images: [42, "/images/legacy.jpg"] as unknown as string[],
      gallery_captions: [42, "Legacy caption"] as unknown as string[],
      gallery_items: [
        null,
        { image: 42, caption: { trim: 1 } },
        { image: "/images/valid.jpg", caption: 42, alt: 42 }
      ] as unknown as SupabaseProjectRow["gallery_items"]
    })
  );

  assert.deepEqual(project.galleryItems, [
    { image: "/images/valid.jpg", caption: "", alt: undefined }
  ]);
});
