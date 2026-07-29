# Project scripts

Stand: 29. Juli 2026

## Development and production

- `npm run dev` starts the Next.js development server.
- `npm run build` creates and type-checks the optimized production build.
- `npm run start` starts the repository's smart local launcher.
- `npm run start:prod` serves an existing production build.

## Static quality checks

- `npm run lint` runs ESLint with zero warnings allowed.
- `npm run typecheck` runs strict TypeScript without emitting files.
- `npm run format` formats the repository with Prettier.
- `npm run format:check` verifies formatting without modifying files.

## Automated tests

- `npm test` runs every `tests/*.test.ts` unit test through the shared
  `scripts/run-unit-tests.mjs` discovery script.
- `npm run test:coverage` runs the same unit suite through c8 and writes the
  ignored local report to `coverage/`.
- `npm run test:e2e` runs the Playwright projects defined in
  `playwright.config.ts`.
- `npm run test:e2e:ui` opens Playwright's interactive runner.
- `npm run migrations:check` validates ordered migration names and the required
  fresh-install baseline.

## Release guards and operations

- `npm run bundle:check` checks generated JavaScript budgets, video sizes,
  raster-image sizes and raster signatures after a production build.
- `npm run smoke:live` performs read-only smoke checks against the configured
  production URL.

The CI-only database job additionally uses the Supabase CLI to start a fresh
local Postgres stack, reset it from all migration files, and run
`supabase db lint`. This is intentionally separate from the fast static
`migrations:check` script.
