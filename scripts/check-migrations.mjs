import { readFile, readdir } from "node:fs/promises";
import process from "node:process";

const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationPattern = /^(\d{14})_[a-z0-9_]+\.sql$/;
const files = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const invalid = files.filter((file) => !migrationPattern.test(file));
const versions = files
  .map((file) => migrationPattern.exec(file)?.[1])
  .filter(Boolean);
const duplicates = versions.filter(
  (version, index) => versions.indexOf(version) !== index
);
const baselineFile = "20260601000100_baseline_schema.sql";
const requiredBaselineStatements = [
  "create table if not exists public.projects",
  "create table if not exists public.inquiries",
  "create table if not exists public.site_settings"
];
const baseline =
  files[0] === baselineFile
    ? (
        await readFile(new URL(baselineFile, migrationDirectory), "utf8")
      ).toLowerCase()
    : "";
const missingBaselineStatements = requiredBaselineStatements.filter(
  (statement) => !baseline.includes(statement)
);

if (
  invalid.length > 0 ||
  duplicates.length > 0 ||
  files[0] !== baselineFile ||
  missingBaselineStatements.length > 0
) {
  if (invalid.length > 0) {
    console.error(`Invalid migration names: ${invalid.join(", ")}`);
  }
  if (duplicates.length > 0) {
    console.error(`Duplicate migration versions: ${duplicates.join(", ")}`);
  }
  if (files[0] !== baselineFile) {
    console.error(
      `The first migration must be the fresh-install baseline ${baselineFile}.`
    );
  }
  if (missingBaselineStatements.length > 0) {
    console.error(
      `Baseline is missing core schema statements: ${missingBaselineStatements.join(", ")}`
    );
  }
  process.exit(1);
}

console.log(
  `Validated ${files.length} ordered Supabase migrations and fresh-install baseline.`
);
