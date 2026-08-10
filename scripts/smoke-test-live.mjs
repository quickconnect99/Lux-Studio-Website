import process from "node:process";

const target = process.argv[2];

if (!target) {
  console.error(
    "Usage: node scripts/smoke-test-live.mjs https://your-domain.tld"
  );
  process.exit(1);
}

const baseUrl = new URL(target);
baseUrl.pathname = "";
baseUrl.search = "";
baseUrl.hash = "";
const expectedOrigin = baseUrl.origin;

function toVisibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function hasRequiredSecurityHeaders(response) {
  const policy = response.headers.get("content-security-policy") ?? "";

  return Boolean(
    policy.includes("script-src-attr 'none'") &&
    policy.includes("object-src 'none'") &&
    response.headers.get("strict-transport-security")?.includes("max-age=") &&
    response.headers.get("x-content-type-options") === "nosniff" &&
    response.headers.get("referrer-policy") ===
      "strict-origin-when-cross-origin"
  );
}

function findCanonicalOrigin(html) {
  const canonical = html.match(
    /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i
  )?.[1];

  if (!canonical) {
    return null;
  }

  try {
    return new URL(canonical, baseUrl).origin;
  } catch {
    return null;
  }
}

const checks = [
  {
    path: "/",
    expectStatus: 200,
    expectVisibleText: ["work"],
    checkSecurityHeaders: true,
    checkCanonical: true
  },
  {
    path: "/contact",
    expectStatus: 200,
    expectVisibleText: ["Send Inquiry"]
  },
  {
    path: "/impressum",
    expectStatus: 200,
    expectVisibleText: ["Company Details"]
  },
  {
    path: "/datenschutz",
    expectStatus: 200,
    expectVisibleText: ["Privacy Policy"]
  },
  {
    path: "/robots.txt",
    expectStatus: 200,
    expectText: ["Sitemap:"],
    rejectText: ["localhost", "127.0.0.1"],
    requireOrigin: true
  },
  {
    path: "/sitemap.xml",
    expectStatus: 200,
    expectText: ["<urlset", "/work/"],
    rejectText: ["localhost", "127.0.0.1"],
    requireOrigin: true
  },
  {
    path: "/admin",
    expectStatus: 200,
    expectVisibleText: ["Sign in to Supabase"],
    checkSecurityHeaders: true
  }
];

const results = [];

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000)
  });
  const body = await response.text();
  const visibleText = toVisibleText(body);
  const allowedStatuses = Array.isArray(check.expectStatus)
    ? check.expectStatus
    : [check.expectStatus];
  const statusOk = allowedStatuses.includes(response.status);
  const textOk =
    (check.expectText ?? []).every((text) =>
      body.toLowerCase().includes(text.toLowerCase())
    ) &&
    (check.expectVisibleText ?? []).every((text) =>
      visibleText.toLowerCase().includes(text.toLowerCase())
    ) &&
    (check.rejectText ?? []).every(
      (text) => !body.toLowerCase().includes(text.toLowerCase())
    );
  const originOk =
    !check.requireOrigin ||
    (body.includes(expectedOrigin) &&
      !body.match(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i));
  const securityOk =
    !check.checkSecurityHeaders || hasRequiredSecurityHeaders(response);
  const canonicalOk =
    !check.checkCanonical || findCanonicalOrigin(body) === expectedOrigin;

  results.push({
    path: check.path,
    status: response.status,
    statusOk,
    textOk,
    originOk,
    securityOk,
    canonicalOk,
    location: response.headers.get("location")
  });
}

const failed = results.filter(
  (result) =>
    !result.statusOk ||
    !result.textOk ||
    !result.originOk ||
    !result.securityOk ||
    !result.canonicalOk
);

for (const result of results) {
  const passed =
    result.statusOk &&
    result.textOk &&
    result.originOk &&
    result.securityOk &&
    result.canonicalOk;
  console.log(
    `${passed ? "PASS" : "FAIL"} ${result.path} status=${result.status} text=${result.textOk} origin=${result.originOk} security=${result.securityOk} canonical=${result.canonicalOk}` +
      (result.location ? ` location=${result.location}` : "")
  );
}

if (failed.length > 0) {
  process.exit(1);
}
