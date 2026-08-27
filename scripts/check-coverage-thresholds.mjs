import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const workspace = process.cwd();
const lcovPath = path.join(workspace, "coverage", "lcov.info");

// Higher than the global 75/75/80/70 gate in package.json#test:coverage.
// Each of these already clears its threshold today — the point is to catch
// a regression in code that touches money-adjacent or data-integrity paths
// (admin persistence, inquiry rate limiting/retention), not to chase 100%.
const thresholds = {
  "lib/admin-persistence.ts": { lines: 95, branches: 70, functions: 90 },
  "lib/admin-project-repository.ts": { lines: 90, branches: 80, functions: 95 },
  "lib/rate-limit.ts": { lines: 95, branches: 85, functions: 90 },
  "lib/inquiry.ts": { lines: 95, branches: 90, functions: 80 },
  "lib/inquiry-rate-limit.ts": { lines: 90, branches: 75, functions: 95 },
  "lib/inquiry-retention.ts": { lines: 90, branches: 75, functions: 75 },
  "lib/admin-storage.ts": { lines: 85, branches: 75, functions: 90 },
  "lib/admin-result.ts": { lines: 85, branches: 75, functions: 95 }
};

function percentage(hit, found) {
  return found === 0 ? 100 : (hit / found) * 100;
}

async function parseLcov(contents) {
  const files = new Map();
  let current = null;

  for (const line of contents.split("\n")) {
    if (line.startsWith("SF:")) {
      const absolute = line.slice(3).trim();
      const relative = path
        .relative(workspace, absolute)
        .split(path.sep)
        .join("/");
      current = { lf: 0, lh: 0, fnf: 0, fnh: 0, brf: 0, brh: 0 };
      files.set(relative, current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("LF:")) current.lf = Number(line.slice(3));
    else if (line.startsWith("LH:")) current.lh = Number(line.slice(3));
    else if (line.startsWith("FNF:")) current.fnf = Number(line.slice(4));
    else if (line.startsWith("FNH:")) current.fnh = Number(line.slice(4));
    else if (line.startsWith("BRF:")) current.brf = Number(line.slice(4));
    else if (line.startsWith("BRH:")) current.brh = Number(line.slice(4));
    else if (line.startsWith("end_of_record")) current = null;
  }

  return files;
}

const lcovContents = await readFile(lcovPath, "utf8").catch((error) => {
  console.error(
    `[coverage-thresholds] Could not read ${lcovPath}: ${error.message}. Run "npm run test:coverage" first.`
  );
  process.exit(1);
});

const files = await parseLcov(lcovContents);
const failures = [];

for (const [file, threshold] of Object.entries(thresholds)) {
  const record = files.get(file);

  if (!record) {
    failures.push(
      `${file}: no coverage recorded (check it is still in test:coverage's --include list).`
    );
    continue;
  }

  const lines = percentage(record.lh, record.lf);
  const functions = percentage(record.fnh, record.fnf);
  const branches = percentage(record.brh, record.brf);

  if (lines < threshold.lines) {
    failures.push(
      `${file}: lines ${lines.toFixed(2)}% (threshold ${threshold.lines}%).`
    );
  }
  if (functions < threshold.functions) {
    failures.push(
      `${file}: functions ${functions.toFixed(2)}% (threshold ${threshold.functions}%).`
    );
  }
  if (branches < threshold.branches) {
    failures.push(
      `${file}: branches ${branches.toFixed(2)}% (threshold ${threshold.branches}%).`
    );
  }

  console.log(
    `${file}: lines ${lines.toFixed(2)}%, functions ${functions.toFixed(2)}%, branches ${branches.toFixed(2)}% (thresholds ${threshold.lines}/${threshold.functions}/${threshold.branches}).`
  );
}

if (failures.length > 0) {
  console.error("\nBusiness-critical coverage thresholds not met:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log("\nAll business-critical coverage thresholds met.");
