# Northline Motion

Premium automotive video portfolio and marketing site scaffolded with Next.js, Tailwind CSS, Framer Motion, and Supabase-ready data/storage hooks.

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
- Placeholder automotive-focused copy and SVG media surfaces

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to your local or production domain so metadata, sitemap, and robots resolve correctly.
4. Add Supabase credentials if you want live auth, database, storage, and the production inquiry endpoint.
5. Run `npm run dev`.

## Supabase notes

- SQL schema is in `supabase/schema.sql`.
- Create a public storage bucket named `projects` or change `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
- Add `SUPABASE_SERVICE_ROLE_KEY` on the server so `/api/inquiries` can persist contact requests without exposing open client-side inserts.
- For a hardened production admin route, add `ADMIN_GATE_USER` and `ADMIN_GATE_PASSWORD` so `/admin` is challenged before the Supabase login is shown.
- Public pages fall back to local placeholder content if Supabase is not configured.
- The admin page works in demo mode without Supabase and persists to Supabase once auth/env vars are added.
- Global settings are read from the `site_settings` table when available.
- See `docs/supabase-production-setup.md` for the production checklist.

## Replace later

- Brand name, navigation copy, and contact details: `lib/site-config.ts`
- Placeholder projects and premium copy: `lib/content.ts`
- Hero showreel path: `components/sections/home-hero.tsx`
- SVG placeholder imagery: `public/images/*`
- Public brand/contact/social fallback: `lib/site-config.ts`

## Media

- Drop the final hero reel in `public/media/hero-showreel.mp4` or replace the video source in the hero component.
- The SVG assets are intentionally lightweight placeholders so the layout stays polished before final photography arrives.
- Project detail pages now render YouTube, Vimeo, and direct MP4 URLs when those values are supplied.
- Demo JPGs and MP4s are included in `public/images/demo-car-*.jpg` and `public/media/*.mp4` for local testing.
