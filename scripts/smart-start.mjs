import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
const nextBinPath = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

const hasProductionBuild = existsSync(buildIdPath);
const nextCommand = hasProductionBuild ? "start" : "dev";

if (!hasProductionBuild) {
  console.log(
    "No production build found in .next/BUILD_ID. Falling back to the Next.js dev server."
  );
}

const child = spawn(process.execPath, [nextBinPath, nextCommand], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

child.on("error", (error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
