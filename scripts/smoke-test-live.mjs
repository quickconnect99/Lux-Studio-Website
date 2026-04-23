import process from "node:process";

const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/smoke-test-live.mjs https://your-domain.tld");
  process.exit(1);
}

const baseUrl = new URL(target);
baseUrl.pathname = "";
baseUrl.search = "";
baseUrl.hash = "";

const checks = [
  {
    path: "/",
    expectStatus: 200,
    expectText: ["<html", "work"]
  },
  {
    path: "/contact",
    expectStatus: 200,
    expectText: ["Send Inquiry"]
  },
  {
    path: "/impressum",
    expectStatus: 200,
    expectText: ["Impressum"]
  },
  {
    path: "/datenschutz",
    expectStatus: 200,
    expectText: ["Datenschutz"]
  },
  {
    path: "/robots.txt",
    expectStatus: 200,
    expectText: ["Sitemap:"]
  },
  {
    path: "/sitemap.xml",
    expectStatus: 200,
    expectText: ["<urlset", "/work/"]
  },
  {
    path: "/admin",
    expectStatus: [200, 307, 308],
    expectText: []
  }
];

const results = [];

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  const response = await fetch(url, { redirect: "manual" });
  const body = await response.text();
  const allowedStatuses = Array.isArray(check.expectStatus)
    ? check.expectStatus
    : [check.expectStatus];
  const statusOk = allowedStatuses.includes(response.status);
  const textOk = check.expectText.every((text) =>
    body.toLowerCase().includes(text.toLowerCase())
  );

  results.push({
    path: check.path,
    status: response.status,
    statusOk,
    textOk,
    location: response.headers.get("location")
  });
}

const failed = results.filter((result) => !result.statusOk || !result.textOk);

for (const result of results) {
  console.log(
    `${result.statusOk && result.textOk ? "PASS" : "FAIL"} ${result.path} status=${result.status}` +
      (result.location ? ` location=${result.location}` : "")
  );
}

if (failed.length > 0) {
  process.exit(1);
}
