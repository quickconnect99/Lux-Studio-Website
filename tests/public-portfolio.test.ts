import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteSettings } from "../lib/site-config";
import {
  adaptSiteSettingsToPublishedProjects,
  hasPublishedHospitalityProject
} from "../lib/public-portfolio";
import type { Project } from "../lib/types";

const carProject: Project = {
  business: "Car",
  title: "Car Project",
  slug: "car-project",
  shortDescription: "Car campaign",
  fullDescription: "Car campaign description",
  category: "Brand Film",
  carModel: "BMW M4",
  location: "Vienna",
  year: 2026,
  coverImage: "/car.jpg",
  galleryImages: ["/car-gallery.jpg"],
  featured: true,
  published: true,
  createdAt: "2026-01-01T00:00:00.000Z"
};

const hospitalityProject: Project = {
  ...carProject,
  business: "Hospitality",
  title: "Hotel Project",
  slug: "hotel-project"
};

test("detects only published hospitality projects", () => {
  assert.equal(hasPublishedHospitalityProject([carProject]), false);
  assert.equal(
    hasPublishedHospitalityProject([
      { ...hospitalityProject, published: false }
    ]),
    false
  );
  assert.equal(
    hasPublishedHospitalityProject([carProject, hospitalityProject]),
    true
  );
});

test("removes hospitality references when no project is published", () => {
  const settings = adaptSiteSettingsToPublishedProjects(defaultSiteSettings, [
    carProject
  ]);
  const serialized = JSON.stringify(settings).toLowerCase();

  assert.equal(serialized.includes("hospitality"), false);
  assert.equal(serialized.includes("hotel"), false);
  assert.equal(settings.seo.title, "Lux Studio | Premium Automotive Campaigns");
  assert.equal(
    settings.hero.copy,
    "A boutique studio creating cinematic campaign films, launch content, and premium still systems for automotive brands and premium products that want atmosphere to feel designed."
  );
});

test("keeps configured copy unchanged when hospitality work exists", () => {
  const settings = adaptSiteSettingsToPublishedProjects(defaultSiteSettings, [
    carProject,
    hospitalityProject
  ]);

  assert.equal(settings, defaultSiteSettings);
});
