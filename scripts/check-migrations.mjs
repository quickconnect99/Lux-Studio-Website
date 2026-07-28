import { readdir } from "node:fs/promises";
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

if (invalid.length > 0 || duplicates.length > 0) {
  if (invalid.length > 0) {
    console.error(`Invalid migration names: ${invalid.join(", ")}`);
  }
  if (duplicates.length > 0) {
    console.error(`Duplicate migration versions: ${duplicates.join(", ")}`);
  }
  process.exit(1);
}

console.log(`Validated ${files.length} ordered Supabase migrations.`);
