# Design System – Northline Motion

> Last updated: 2026-03-17
> Stack: Next.js 15 · React 19 · Tailwind CSS 3 · Framer Motion 12 · Supabase

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Typography](#2-typography)
3. [Spacing](#3-spacing)
4. [Shadows & Borders](#4-shadows--borders)
5. [Animation](#5-animation)
6. [Component Classes (globals.css)](#6-component-classes-globalscss)
7. [UI Components](#7-ui-components)
8. [Layout Patterns](#8-layout-patterns)
9. [Interactive States](#9-interactive-states)
10. [Responsive Breakpoints](#10-responsive-breakpoints)
11. [Open TODOs](#11-open-todos)

---

## 1. Design Tokens

All tokens are CSS custom properties declared in `app/globals.css` and
exposed to Tailwind via `tailwind.config.ts`.

### Colour Palette

| Token              | Value                        | Usage                                  |
|--------------------|------------------------------|----------------------------------------|
| `--background`     | `#f4f1ea`                    | Page background (warm cream)           |
| `--foreground`     | `#1b232b`                    | Primary text, dark UI elements         |
| `--muted`          | `#58636c`                    | Secondary text, labels, captions       |
| `--muted-warm`     | `#6b6360`                    | Secondary text on warm/dark surfaces   |
| `--accent`         | `#9eff4f`                    | Neon lime – primary accent             |
| `--accent-soft`    | `rgba(158, 255, 79, 0.65)`   | Accent backgrounds, subtle highlights  |
| `--accent-blue`    | `#7dd3fc`                    | Complementary cool accent              |
| `--panel`          | `rgba(255, 255, 255, 0.80)`  | Primary glass panel background         |
| `--panel-secondary`| `rgba(255, 255, 255, 0.70)`  | Nested panels, cards                   |
| `--panel-subtle`   | `rgba(255, 255, 255, 0.55)`  | Subtle background fills                |
| `--panel-dark`     | `#11161b`                    | Dark sections, video overlays          |
| `--panel-dark-mid` | `#1a1f25`                    | Nested dark panels (lighter shade)     |
| `--line`           | `rgba(27, 35, 43, 0.12)`     | Dividers, borders (12% opacity)        |
| `--error`          | `#ef4444`                    | Validation errors                      |
| `--success`        | `#10b981`                    | Success states                         |
| `--warning`        | `#f59e0b`                    | Warnings, near-limit indicators        |

> **Rule:** Always reference semantic tokens (e.g. `var(--error)`) instead of
> raw hex/rgba values in components. This keeps the colour system consistent
> and easy to theme.

---

## 2. Typography

### Font Families

| Variable          | Font            | Weights          | Usage                              |
|-------------------|-----------------|------------------|------------------------------------|
| `--font-display`  | Bodoni Moda     | 400 500 600 700  | Hero headlines, section headings   |
| `--font-sans`     | Sora            | 300 400 500 600 700 | Body text, UI labels, nav      |
| `--font-mono`     | IBM Plex Mono   | 400 500          | Index numbers, year, tech metadata |

Apply with: `font-[family:var(--font-display)]`

### Heading Scale (display / Bodoni Moda)

| Level | Size (clamp / fixed)             | Tracking    | Line-height  |
|-------|----------------------------------|-------------|--------------|
| H1    | `clamp(3rem, 8vw, 7rem)`         | `-0.04em`   | `0.88`       |
| H2    | `text-4xl sm:text-5xl lg:text-7xl` | `-0.05em` | `0.9`        |
| H3    | `text-3xl sm:text-4xl`           | `-0.04em`   | `none`       |

### Body Scale (Sora)

| Role           | Class              | Size      | Weight | Line-height |
|----------------|--------------------|-----------|--------|-------------|
| Body large     | `text-base sm:text-lg` | 16–18 px | 400  | `leading-8` |
| Body regular   | `text-sm`          | 14 px     | 400    | `leading-7` |
| UI / labels    | `text-xs`          | 12 px     | 500–600 | normal    |
| Captions       | `text-[0.65rem]`   | 10.4 px   | 400    | normal      |

### Letter-Spacing Scale (Tailwind extend)

| Key       | Value   | Usage                                |
|-----------|---------|--------------------------------------|
| `tracking-ui`      | `0.20em` | Buttons, pills, control labels |
| `tracking-meta`    | `0.26em` | Metadata labels, captions       |
| `tracking-eyebrow` | `0.30em` | Section eyebrows                |
| `tracking-wide`    | `0.34em` | Special accent text             |

> **Rule:** Display headings use *negative* tracking (`-0.04em` to `-0.05em`).
> UI elements use *positive* tracking (`0.20em` to `0.34em`).
> Body text: default (no tracking class).

---

## 3. Spacing

### Section Shells & Vertical Rhythm

| Class                  | Mobile  | Tablet  | Desktop |
|------------------------|---------|---------|---------|
| `.section-shell`       | px-5    | px-8    | px-10   |
| `.section-space`       | py-12   | py-16   | py-20   |
| `.section-space-medium`| py-8    | py-12   | py-14   |
| `.section-space-tight` | py-6    | py-8    | py-10   |

> **Rule:** Always use `pt-0` on sections that follow another section without a visual break, so only the preceding section's bottom padding forms the gap.

### Component Padding Tiers

| Tier       | Value   | Usage                              |
|------------|---------|------------------------------------|
| Compact    | `p-4`   | Metadata cards, form labels        |
| Standard   | `p-6`   | Glass panels, section interiors    |
| Generous   | `p-8`   | Featured sections, hero areas      |

---

## 4. Shadows & Borders

### Box Shadows

| Token         | Value                                      | Usage                     |
|---------------|--------------------------------------------|---------------------------|
| `shadow-halo` | `0 24px 100px rgba(15, 23, 32, 0.12)`     | Hero media, film frames   |
| `shadow-card` | `0 16px 60px rgba(17, 24, 28, 0.12)`      | Cards, glass panels       |

### Border Radius Scale

| Value              | Usage                                         |
|--------------------|-----------------------------------------------|
| `rounded-full`     | Buttons, pills, logo badge                    |
| `rounded-2xl`      | Input fields, mobile nav items                |
| `rounded-[1.25rem]`| Metadata cards                                |
| `rounded-[1.5rem]` | Horizontal strip items, textarea              |
| `rounded-[1.75rem]`| Film frames, featured images                  |
| `rounded-[2rem]`   | Glass panels (via `.panel-2xl`)               |
| `rounded-[2.5rem]` | Page header panels, CTA sections              |
| `rounded-[3rem]`   | Hero background gradient blobs                |

> **Pattern:** Larger containing elements = larger radius. Smaller UI atoms = smaller radius.

---

## 5. Animation

### Global Transition (globals.css)

```css
/* Colour/opacity – snappy */
transition: color 150ms ease, background-color 150ms ease,
            border-color 150ms ease, opacity 150ms ease;

/* Transform – slightly slower for smoothness */
transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Press feedback */
a:active, button:active { transform: scale(0.96); }
```

### Framer Motion Easing

All Framer animations use the same custom cubic-bezier:
```
ease: [0.22, 1, 0.36, 1]   // smooth, slightly springy
```

### Reveal Component Variants

| Variant   | Offset | Duration | Use case                    |
|-----------|--------|----------|-----------------------------|
| `subtle`  | 18 px  | 0.55 s   | Dense lists, grids          |
| `default` | 36 px  | 0.80 s   | Standard sections (default) |
| `bold`    | 60 px  | 1.00 s   | Hero / featured elements    |

```tsx
// Usage examples
<Reveal variant="subtle" delay={index * 0.04}>…</Reveal>
<Reveal variant="bold" direction="left">…</Reveal>
```

### Named Animations

| Name        | Duration  | Trigger           | Location                       |
|-------------|-----------|-------------------|--------------------------------|
| `marquee`   | 34 s loop | always (CSS)      | `.marquee-track`               |
| `shake`     | 0.4 s     | `.shake` class    | Form error feedback            |
| Icon hover  | 0.3 s     | `group-hover`     | `LinkButton` ArrowUpRight      |
| Menu toggle | 0.18 s    | `AnimatePresence` | `SiteHeader` icon swap         |
| Mobile menu | 0.22 s    | `AnimatePresence` | `SiteHeader` slide-in          |

### Reduced Motion

All animations respect `prefers-reduced-motion`:
- `Reveal` renders a plain `<div>` when `useReducedMotion()` is true
- `.marquee-track` animation is disabled
- `.split-trail-underline::after` transition is removed
- `a:active / button:active` scale is suppressed

---

## 6. Component Classes (globals.css)

### Layout

| Class                | Description                                    |
|----------------------|------------------------------------------------|
| `.section-shell`     | Max-width container with responsive padding    |
| `.section-space`     | Standard vertical section spacing              |
| `.section-space-medium` | Intermediate spacing                        |
| `.section-space-tight`  | Tighter spacing for sub-sections            |
| `.divider`           | Full-width 1 px horizontal rule               |

### Visual Treatments

| Class              | Description                                          |
|--------------------|------------------------------------------------------|
| `.glass-panel`     | Frosted white panel (border + bg + shadow + blur)    |
| `.dark-panel`      | Dark gradient panel with subtle lime radial          |
| `.film-frame`      | Media container with layered border depth effect     |
| `.grain`           | Subtle film grain overlay via `::before`             |
| `.texture-grid`    | Background dot/grid pattern via `::before`           |

### Typography

| Class                     | Description                                    |
|---------------------------|------------------------------------------------|
| `.eyebrow`                | Section label with accent left bar             |
| `.metadata-label`         | `0.65rem` uppercase, `tracking-meta`, muted    |
| `.metadata-value`         | `sm` medium, `tracking-[0.08em]`, foreground   |
| `.metadata-value-compact` | `xs` uppercase, `tracking-wide`, foreground    |
| `.metadata-number`        | Monospace, accent coloured index/number        |
| `.split-trail-underline`  | Animated accent underline for headline trail   |

### Forms & Buttons

| Class           | Description                                              |
|-----------------|----------------------------------------------------------|
| `.input-field`  | Full-width rounded input with focus scale + border       |
| `.textarea-field`| Same as input-field for textareas                       |
| `.field-error`  | Error border using `var(--error)` (replaces `border-red-500`) |
| `.action-button`| Primary submit button (dark bg, hover → accent)          |
| `.control-pill` | Inline pill with border for controls/toggles             |
| `.muted-pill`   | Secondary pill, muted text                               |
| `.toggle-row`   | Horizontal toggle with border                            |
| `.shake`        | Shake animation for form validation error feedback       |

---

## 7. UI Components

### `<Reveal>` — `components/ui/reveal.tsx`

Scroll-triggered entrance animation with viewport detection.

```tsx
type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;           // seconds, default 0
  direction?: "up" | "left" | "right";  // default "up"
  variant?: "subtle" | "default" | "bold";  // default "default"
};
```

### `<LinkButton>` — `components/ui/link-button.tsx`

Animated anchor with ArrowUpRight icon.

```tsx
type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";  // default "primary"
  className?: string;
};
```

| Variant     | Default state                  | Hover state                   |
|-------------|--------------------------------|-------------------------------|
| `primary`   | Dark bg, white text            | Accent bg, dark text          |
| `secondary` | White/70 bg, border            | Accent border, white bg       |
| `ghost`     | Transparent, no border, no px  | Text opacity 80%              |

### `<SplitHeadline>` — `components/ui/split-headline.tsx`

Large display headline split into two lines with animated accent underline on `trail`.

```tsx
type SplitHeadlineProps = {
  lead: string;       // first line, foreground colour
  trail: string;      // second line, accent colour + animated underline
  eyebrow?: string;   // small label above
  copy?: string;      // body text below
  align?: "left" | "center";  // default "left"
  className?: string;
};
```

> The underline on `trail` uses `.split-trail-underline::after` (CSS) and
> triggers when a parent has class `.group-reveal`. The `Reveal` component
> does not add this class automatically – add it manually on the wrapping
> element when the headline is always visible (e.g. hero sections).

### `<MetadataGrid>` — `components/ui/metadata-grid.tsx`

Reusable 3-column metadata row (Model / Location / Year pattern).

```tsx
type MetadataGridProps = {
  items: { label: string; value: string }[];
};
```

### `<RevealList>` — `components/ui/reveal-list.tsx`

Maps an array of items to staggered `<Reveal>` wrappers. Renders a React
fragment — place inside any grid or flex container. The parent handles layout;
`RevealList` adds only the animation layer.

```tsx
type RevealListProps<T> = {
  items: T[];
  getKey: (item: T) => React.Key;
  render: (item: T, index: number) => React.ReactNode;
  stagger?: number;          // delay increment in seconds, default 0.05
  variant?: RevealVariant;
  direction?: "up" | "left" | "right";
  itemClassName?: string;    // class applied to every Reveal wrapper
};
```

**Used in:** `app/services/page.tsx`, `app/page.tsx` (services grid),
`app/about/page.tsx` (values grid).

### `<ContactInfo>` — `components/ui/contact-info.tsx`

Renders email (as `<a href="mailto:…">`), phone, and city from
`SiteSettings["contact"]`. All three fields are optional.

```tsx
type ContactInfoProps = {
  contact: SiteSettings["contact"];
  showIcons?: boolean;  // show Mail / Phone / MapPin icons, default false
};
```

**Used in:** `app/contact/page.tsx` (`showIcons`), `components/layout/site-footer.tsx`.

### `<FieldError>` — `components/ui/field-error.tsx`

Inline validation error message using `var(--error)` instead of a hardcoded
Tailwind red class.

```tsx
<FieldError id="field-id-error" message="Error text" />
```

Pair with `aria-describedby` on the input for screen-reader support.

---

## 8. Layout Patterns

### Page Structure

```
RootLayout (server)
├── SiteHeader (client) – sticky, z-50
├── Template (client) – page-transition wrapper
│   └── Page (server or client)
│       └── … sections
└── SiteFooter (server)
```

### Common Grid Ratios

| Pattern              | Classes                              | Usage                    |
|----------------------|--------------------------------------|--------------------------|
| Asymmetric 2-col     | `lg:grid-cols-[0.9fr_1.1fr]`         | Featured projects, about |
| Equal 2-col          | `sm:grid-cols-2`                     | Form fields, footer cols |
| 3-col services       | `lg:grid-cols-[140px_1fr_0.9fr]`     | Services page            |
| Project grid         | `md:grid-cols-2 xl:grid-cols-3`      | Work page                |
| Footer               | `sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]` | Footer     |

---

## 9. Interactive States

### Buttons

| State   | Transform          | Timing                           |
|---------|--------------------|----------------------------------|
| Default | –                  | –                                |
| Hover   | colour/bg change   | 150 ms ease                      |
| Active  | `scale(0.96)`      | 200 ms cubic-bezier(0.4,0,0.2,1) |
| Focus   | double ring (1.5 px + 3 px accent) | instant             |
| Disabled| `opacity: 0.70`    | –                                |

### Inputs

| State  | Border        | Background  | Scale            |
|--------|---------------|-------------|------------------|
| Default| `var(--line)` | white/85    | 1                |
| Focus  | `var(--accent)`| white/95   | `scale(1.005)`   |
| Error  | `var(--error)` | unchanged  | unchanged        |

### Navigation Links

| State  | Colour         | Underline                    |
|--------|----------------|------------------------------|
| Default| `text-muted`   | none                         |
| Hover  | unchanged      | accent bar expands `0→100%`  |
| Active | `text-foreground` | full-width accent bar     |

---

## 10. Responsive Breakpoints

| Name | px    | Tailwind prefix | Notes                     |
|------|-------|-----------------|---------------------------|
| xs   | < 640 | (none / default) | Single column, min padding |
| sm   | 640   | `sm:`           | 2-col grids begin          |
| md   | 768   | `md:`           | Project grid 2-col         |
| lg   | 1024  | `lg:`           | Desktop nav, 3-col layouts |
| xl   | 1280  | `xl:`           | Project grid 3-col         |

---

## 11. Open TODOs

> Items marked **[CONTENT]** require real brand assets.
> Items marked **[FEATURE]** are new functionality.
> Items marked **[POLISH]** are cosmetic/UX refinements.
> Items marked **[PERF]** affect performance or SEO.

### Critical – Before Production

| # | Status | Type | Task | File |
|---|--------|------|------|------|
| 1 | ⚠️ Open | CONTENT | Replace brand name, mark, strapline placeholders | `lib/site-config.ts` |
| 2 | ⚠️ Open | CONTENT | Replace hero showreel path (`/media/hero-showreel.mp4`) | `components/sections/home-hero.tsx` |
| 3 | ⚠️ Open | CONTENT | Replace page copy placeholders | `app/page.tsx`, `app/about/page.tsx` |
| 4 | ⚠️ Open | CONTENT | Replace behind-the-scenes placeholder text | `app/work/[slug]/page.tsx` |
| 5 | ✅ Done | FEATURE | Validate Supabase env vars at build time | `lib/supabase.ts` |
| 6 | ✅ Done | FEATURE | Remove unsafe type assertion in admin | `components/admin/admin-dashboard.tsx` |

### Short-term – Design & UX

| # | Status | Type | Task | File |
|---|--------|------|------|------|
| 7  | ✅ Done | POLISH | `group-reveal` on hero via `onAnimationComplete`; Reveal component adds it after scroll-entry | `reveal.tsx`, `home-hero.tsx` |
| 8  | ✅ Done | POLISH | `border-red-500`/`text-red-600` → `var(--error)` via `.field-error` class | admin & inquiry-form |
| 9  | ✅ Done | POLISH | `tracking-[0.Xem]` → `tracking-ui/meta/eyebrow/wide` across all component files | Multiple |
| 10 | ✅ Done | POLISH | `Reveal variant="bold"` on featured-projects text blocks | `featured-projects.tsx` |
| 11 | ✅ Done | POLISH | Subtle animation (18 px / 0.55 s) on project grid cards | `project-grid.tsx` |
| 12 | ✅ Done | POLISH | `.metadata-number` on project index numbers | `featured-projects.tsx`, `page.tsx` |
| 13 | ✅ Done | POLISH | Lucide icons on service rows (icon badge) and contact methods (Mail/Phone/MapPin) | `services/page.tsx`, `contact/page.tsx` |
| 14 | ✅ Done | POLISH | `sizes` prop present on all `<Image>` components | All image files |

### Medium-term – Features

| # | Status | Type | Task | File |
|---|--------|------|------|------|
| 15 | ✅ Done | FEATURE | Lightbox with keyboard nav (←→ Esc) on SelectedFrames | `components/ui/lightbox.tsx`, `selected-frames.tsx` |
| 16 | ✅ Done | FEATURE | Drag-to-scroll (mouse + touch) on HorizontalStillStrip | `horizontal-still-strip.tsx` |
| 17 | ✅ Done | FEATURE | "Load more" pagination (6 per page) with animated entry | `project-grid.tsx` |
| 18 | ✅ Done | FEATURE | OpenGraph images for project detail pages (`coverImage`) | `app/work/[slug]/page.tsx` |
| 19 | ✅ Done | FEATURE | Schema.org Organisation JSON-LD in root layout | `app/layout.tsx` |
| 20 | ⚠️ Open | FEATURE | Admin: bulk publish/unpublish projects | `components/admin/admin-dashboard.tsx` |
| 21 | ⚠️ Open | FEATURE | Admin: project search / filter | `components/admin/admin-dashboard.tsx` |

### Tech Debt

| # | Status | Type | Task | File |
|---|--------|------|------|------|
| 22 | ✅ Done | PERF | `viewport-fit=cover` via `export const viewport` | `app/layout.tsx` |
| 23 | ⚠️ Open | PERF | Audit white text contrast on low-opacity backgrounds (WCAG AA) | `home-hero.tsx`, `featured-projects.tsx` |
| 24 | ✅ Done | PERF | ESLint `consistent-type-imports` rule already active | `eslint.config.mjs` |
| 25 | ⚠️ Open | PERF | Unit tests for `lib/video.ts`, `lib/utils.ts` | – |
| 26 | ✅ Done | PERF | `useForm` custom hook extracted and used in admin dashboard | `hooks/use-form.ts` |

---

## 12. Custom Hooks

### `useFilteredPagination` — `hooks/use-filtered-pagination.ts`

Generic filter + pagination hook. Extracts category filtering, page-size
slicing, and "load more" state from components.

```ts
function useFilteredPagination<T extends Record<string, unknown>>(
  items: T[],
  categoryKey: keyof T & string,  // key whose value is the category string
  pageSize: number
): {
  categories: string[];       // ["All", ...unique values]
  activeCategory: string;
  selectCategory: (cat: string) => void;  // also resets to page 1
  visible: T[];
  hasMore: boolean;
  remaining: number;
  loadMore: () => void;
}
```

**Used in:** `components/sections/project-grid.tsx`.

### `useInquiryForm` — `hooks/use-inquiry-form.ts`

All state and submit logic for the inquiry form. Separates validation,
sanitization, and Supabase integration from the JSX render layer.

```ts
function useInquiryForm(): {
  formState: Inquiry;
  errors: InquiryErrors;
  status: "idle" | "submitting" | "success" | "error";
  message: string;
  shaking: boolean;
  updateField: <K extends keyof Inquiry>(field: K, value: Inquiry[K]) => void;
  handleSubmit: (event: { preventDefault(): void }) => Promise<void>;
  briefRemaining: number;
  briefNearLimit: boolean;   // ≤ 150 chars left  → warning colour
  briefAtLimit: boolean;     // ≤ 0 chars left     → error colour
  isConfigured: boolean;     // true if Supabase env vars present
}
```

Also exports `BRIEF_MAX = 1500` and types `InquiryErrors`, `InquiryStatus`.

**Used in:** `components/sections/inquiry-form.tsx`.

### `serviceIcons` — `lib/content.ts`

Maps service number strings to Lucide icon components. Co-located with the
`services` array so icon assignments stay in sync with service data.

```ts
export const serviceIcons: Record<string, ComponentType<{ className?: string }>>
// "01" → Film, "02" → Camera, "03" → Smartphone,
// "04" → Video, "05" → Clapperboard, "06" → MapPin
```

**Used in:** `app/services/page.tsx`.

---

## Changelog

| Date       | Change                                                              |
|------------|---------------------------------------------------------------------|
| 2026-03-17 | Initial design system implementation. All tokens, components, layout patterns and open TODOs documented. |
| 2026-03-17 | `globals.css` – added semantic colour tokens, panel tiers, active-press scale, layered film-frame shadow, input focus micro-interaction, marquee pause-on-hover, shake animation, split-trail-underline, section-space-medium |
| 2026-03-17 | `tailwind.config.ts` – added letter-spacing scale (ui/meta/eyebrow/wide), colour tokens for error/success/warning/accent-soft/accent-blue/muted-warm/panel variants |
| 2026-03-17 | `reveal.tsx` – added `variant` prop: subtle / default / bold |
| 2026-03-17 | `link-button.tsx` – active:scale-95, icon scale on hover |
| 2026-03-17 | `split-headline.tsx` – split-trail-underline CSS class on trail span |
| 2026-03-17 | `site-header.tsx` – logo badge hover scale, animated icon swap (AnimatePresence), mobile menu slide-in animation |
| 2026-03-17 | `site-footer.tsx` – responsive `sm:grid-cols-2`, email as `<a href="mailto:">` |
| 2026-03-17 | `home-hero.tsx` – video container: `min-h-[300px] sm:min-h-[420px] lg:min-h-[640px]` |
| 2026-03-17 | `featured-projects.tsx` – sticky only `sm:`, heading `text-4xl sm:text-5xl lg:text-7xl` |
| 2026-03-17 | `project-grid.tsx` – hover scale 1.05 → 1.03, Framer `whileTap` on filter pills, "Open Project" colour on hover |
| 2026-03-17 | `horizontal-still-strip.tsx` – converted to Client Component, pause-on-hover via React state + inline `animationPlayState` |
| 2026-03-17 | `inquiry-form.tsx` – character counter for brief, `var(--error/--success/--warning)` via inline styles, shake animation on validation error, `SubmitEvent` type replacing deprecated `FormEvent`, `FieldError` helper component |
| 2026-03-17 | `lib/supabase.ts` – server-side build/runtime warning when only one of the two Supabase env vars is set |
| 2026-03-17 | `reveal.tsx` – `onAnimationComplete` adds `group-reveal` class once entrance finishes, enabling CSS-sequenced effects on children |
| 2026-03-17 | `home-hero.tsx` – `heroRevealed` state adds `group-reveal` on hero motion.div after load animation; video container responsive heights `300px → sm:420px → lg:640px` |
| 2026-03-17 | Tracking tokens unified across all component files: `tracking-[0.24em]` → `tracking-meta`, `tracking-[0.28em]` → `tracking-ui`, `tracking-[0.30/32em]` → `tracking-eyebrow`, `tracking-[0.34em]` → `tracking-wide` |
| 2026-03-17 | `admin-dashboard.tsx` – deprecated `FormEvent` replaced with `{ preventDefault(): void }` minimal structural type; same fix applied to `inquiry-form.tsx` |
| 2026-03-17 | `featured-projects.tsx` – `Reveal variant="bold"`, project number uses `.metadata-number` class |
| 2026-03-17 | `project-grid.tsx` – subtle animation (18 px/0.55 s), `AnimatePresence mode="popLayout"` on cards, "Load more" button (PAGE_SIZE=6) with remaining count badge |
| 2026-03-17 | `app/page.tsx` – service number uses `.metadata-number`; `bg-white/72` → `bg-white/70` |
| 2026-03-17 | `app/services/page.tsx` – icon badge per service row (Lucide); `tracking-[0.34em]` → `tracking-wide` |
| 2026-03-17 | `app/contact/page.tsx` – Mail/Phone/MapPin icons on contact details; email is now `<a href="mailto:">` |
| 2026-03-17 | `components/ui/lightbox.tsx` – new component: full-screen image overlay with prev/next/close controls, keyboard nav (←→Esc), Framer Motion fade+scale |
| 2026-03-17 | `selected-frames.tsx` – converted to Client Component; integrates Lightbox; hover shows expand icon; `Reveal variant="subtle"` on grid items |
| 2026-03-17 | `horizontal-still-strip.tsx` – mouse + touch drag-to-scroll via `scrollLeft` manipulation; outer scroll container with hidden scrollbar |
| 2026-03-17 | `app/layout.tsx` – `export const viewport` with `viewportFit: "cover"` (#22); Schema.org Organisation JSON-LD via `<Script>` (#19) |
| 2026-03-17 | Spacing scale reduced: `section-space` py-16→py-12, `section-space-medium` py-14→py-8, `section-space-tight` py-12→py-6 (and proportionally at sm/lg). Footer `pt-16→pt-10`. |
| 2026-03-17 | `hooks/use-filtered-pagination.ts` – generic filter + pagination hook extracted from `project-grid.tsx` |
| 2026-03-17 | `hooks/use-inquiry-form.ts` – all form state, validation, sanitization, and Supabase submit logic extracted from `inquiry-form.tsx` |
| 2026-03-17 | `components/ui/contact-info.tsx` – new component; replaces duplicated email/phone/city markup in `contact/page.tsx` and `site-footer.tsx` |
| 2026-03-17 | `components/ui/reveal-list.tsx` – new component; replaces `items.map(…<Reveal delay={i*0.05}>…)` pattern in services, home, about pages |
| 2026-03-17 | `components/ui/field-error.tsx` – extracted from `inquiry-form.tsx`; reusable inline validation error using `var(--error)` |
| 2026-03-17 | `lib/content.ts` – `serviceIcons` Record moved from `app/services/page.tsx`; co-located with services data |
| 2026-03-17 | `app/about/page.tsx` – remaining `tracking-[0.3em]` → `tracking-eyebrow` |
| 2026-03-17 | `page-header.tsx` – `SplitHeadline` wrapped in `<Reveal variant="bold">` so all sub-page headers animate in on load |
| 2026-03-17 | `project-grid.tsx` – "Open Project" now shows `ArrowUpRight` icon with diagonal hover animation (consistent with `LinkButton`) |
| 2026-03-17 | `app/services/page.tsx` – deliverable items get `border-l-2 border-l-accent` left accent stripe |
| 2026-03-17 | `featured-projects.tsx` – ghost index number (`aria-hidden`, `text-foreground/[0.04]`, `text-[9rem]→lg:text-[16rem]`) added as absolute backdrop behind each project's text content |
| 2026-03-17 | White text contrast pass: `text-white/72→/80` (body), `text-white/78→/80` (body), `text-white/68→/75` (metadata labels), `text-white/65→/70` (eyebrow), `text-white/70→/75` (hero meta row), `text-white/45→/55` (stat labels) across home-hero, project-grid, featured-projects, project-media, page.tsx, work/[slug]/page.tsx |
