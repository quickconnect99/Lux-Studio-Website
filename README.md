# Lux Studio

Production-oriented automotive portfolio and marketing site built with Next.js,
Tailwind CSS, Framer Motion, and Supabase-backed content, auth, inquiries, and
media storage.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Framer Motion
- Supabase Auth, Database, and Storage hooks

## What is included

- Cinematic home page with split headlines, sticky project sections, still strip, and selected frames layout
- Work page with category filters and premium hover states
- Dynamic project detail pages
- Services, About, and Contact pages
- Simple admin workspace for editing project content, global social/contact settings, and uploading assets
- Versioned Supabase migrations, protected admin access, resilient public error
  states, and automated quality checks

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to your local or production domain so metadata, sitemap, and robots resolve correctly.
4. Add Supabase credentials if you want live auth, database, storage, and the production inquiry endpoint.
5. Run `npm run dev`.

## Developer orientation

- Start with `docs/developer-onboarding.md` for an approachable architecture
  overview, the public and admin data flows, a recommended reading order, and
  safe recipes for common changes.
- See `docs/project-scripts.md` for the purpose and prerequisites of every
  quality command.
- See `DESIGN_SYSTEM.md` before changing visual tokens, typography, layout, or
  interaction patterns.

## Supabase notes

- SQL schema is in `supabase/schema.sql`.
- Create a public storage bucket named `projects` or change `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
- Add `SUPABASE_SERVICE_ROLE_KEY` on the server so `/api/inquiries` can persist contact requests without exposing open client-side inserts.
- Add `RESEND_API_KEY`, `INQUIRY_EMAIL_TO`, and optionally `INQUIRY_EMAIL_FROM` so saved inquiries also send an email notification.
- `/admin` uses Supabase Auth directly. Database and storage access is restricted to users listed in `public.admin_users`.
- Public pages use local demo content only when Supabase is intentionally not configured.
- The admin page works in demo mode without Supabase and persists to Supabase once auth/env vars are added.
- Global settings are read from the `site_settings` table when available.
- See `docs/supabase-production-setup.md` for the production checklist.
- See `docs/live-launch-checklist.md` for the launch sequence and smoke test command.

## Production content gates

- Apply every migration in `supabase/migrations`.
- Enter final brand, contact, social, project, and legal content in the CMS and
  `lib/legal.ts`.
- Replace demo projects and media before relying on the no-Supabase fallback.
- Follow `docs/technical-roadmap.md` for remaining external release gates.

## Media

- Drop the final hero reel in `public/media/hero-showreel.mp4` or replace the video source in the hero component.
- The SVG assets are intentionally lightweight placeholders so the layout stays polished before final photography arrives.
- Project detail pages now render YouTube, Vimeo, and direct MP4 URLs when those values are supplied.
- Demo JPGs and MP4s are included in `public/images/demo-car-*.jpg` and `public/media/*.mp4` for local testing.
