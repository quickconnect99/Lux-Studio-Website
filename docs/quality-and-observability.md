# Quality and Observability

## Optional first-party Web Vitals

Set `NEXT_PUBLIC_ENABLE_TELEMETRY=true` at build and runtime to send CLS, FCP,
INP, LCP and TTFB to `/api/telemetry`. The endpoint records only metric name,
numeric value, rating and navigation type in the existing structured server
log. It does not record the visited URL, form contents or advertising IDs.
All Telemetry responses include `x-request-id` and
`cache-control: no-store`; rejected origins, invalid metrics, parsing
failures, and rate limits emit PII-free structured events.

Keep the flag disabled until log retention and operational access have been
approved. The public privacy page automatically documents collection whenever
the flag is enabled.

## Isolated authenticated CMS test

The Playwright mutation test is skipped by default. Run it only against a
dedicated Supabase test project:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ENABLE_ADMIN=true
E2E_ADMIN_EMAIL=...
E2E_ADMIN_PASSWORD=...
E2E_ALLOW_CMS_MUTATIONS=true
```

Build the application with the test project variables, then run the
`desktop-1440` `admin-integration.spec.ts` test. The test changes the SEO title,
verifies the save, and restores the original value in a `finally` block.

`NEXT_PUBLIC_ENABLE_ADMIN_DEMO=true` exists only for deterministic local and CI
browser tests without Supabase. Never set it in a public deployment.

## Server operations

- Inquiry, Telemetry, Revalidate, Retention, and notification-retry responses
  carry a request ID that can be matched to structured logs.
- `inquiry.notification_retry_completed` reports only aggregate counts; it
  does not include names, addresses, companies, or briefs.
- `inquiry.retention_completed` reports the configured days and deleted
  row count.
- Alert on repeated `inquiry.rate_limit_unavailable`,
  `inquiry.notification_claim_failed`,
  `inquiry.notification_retry_failed`, and
  `inquiry.retention_failed` events.
- Confirm both Cron schedules in the deployment platform. Repository
  configuration alone is not execution evidence.

## Release evidence

The release gate consists of:

- Prettier, TypeScript and ESLint
- Unit tests with coverage output and ordered migration validation
- Next.js production build
- JavaScript, video and repository-image budgets
- responsive Playwright matrix including a CI-only mobile WebKit project
- Axe WCAG A/AA audit
- visual baseline
- production dependency audit

The CI mutation test is tagged `@cms-mutation`. The normal browser matrix
excludes this tag and runs without write access. A dedicated later step enables
only that spec when every isolated-test credential is present.
