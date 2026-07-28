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

test("keeps CMS copy authoritative without hospitality projects", () => {
  const settings = adaptSiteSettingsToPublishedProjects(defaultSiteSettings, [
    carProject
  ]);

  assert.equal(settings, defaultSiteSettings);
});

test("keeps configured copy unchanged when hospitality work exists", () => {
  const settings = adaptSiteSettingsToPublishedProjects(defaultSiteSettings, [
    carProject,
    hospitalityProject
  ]);

  assert.equal(settings, defaultSiteSettings);
});
