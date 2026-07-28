import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const workspaceDirectory = fileURLToPath(new URL("../", import.meta.url));
const testDirectory = path.join(workspaceDirectory, "tests");
const testFiles = (await readdir(testDirectory))
  .filter((file) => file.endsWith(".test.ts"))
  .sort()
  .map((file) => path.join(testDirectory, file));
const tsxCli = fileURLToPath(
  new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url)
);
const result = spawnSync(process.execPath, [tsxCli, "--test", ...testFiles], {
  cwd: workspaceDirectory,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
