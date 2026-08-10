# Lux Studio Design System

> Last verified: 2026-08-01
> Stack: Next.js 16 · React 19 · Tailwind CSS 3 · Framer Motion 12

This document describes the current public-site design system. It is a usage
guide, not a second implementation of the tokens.

## Sources of truth

When this document and the code disagree, use these files in this order:

1. `app/globals.css` for runtime CSS variables and shared component classes.
2. `lib/themes.ts` for supported theme IDs, labels, and the default theme.
3. `tailwind.config.ts` for Tailwind aliases, tracking, shadows, and gradients.
4. `lib/motion.ts` for shared Framer Motion timing.
5. The component itself for its public props and local responsive layout.

Product work and release tasks belong in `docs/technical-roadmap.md` and
`docs/live-launch-checklist.md`, not in this reference.

## 1. Themes and colour

The public site supports exactly two themes:

| Theme         | ID              | Mode  | Role            |
| ------------- | --------------- | ----- | --------------- |
| Vintage Dark  | `gpt-vintage`   | dark  | Default         |
| Vintage Light | `vintage-light` | light | User-selectable |

`ThemeProvider` persists the selected ID in `localStorage`. The inline
initialisation script validates stored values against `themeIds` before React
hydrates, preventing an invalid theme or a colour flash. The `:root` fallback
mirrors Vintage Dark so the CSS remains coherent even without `data-theme`.

### Core runtime tokens

| Token               | Vintage Dark                | Vintage Light               | Use                             |
| ------------------- | --------------------------- | --------------------------- | ------------------------------- |
| `--background`      | `#101917`                   | `#f3eadb`                   | Page background                 |
| `--foreground`      | `#f2e9db`                   | `#1e493d`                   | Primary text and strong UI      |
| `--muted`           | `#b7aa97`                   | `#625f57`                   | Secondary copy and labels       |
| `--muted-warm`      | `#c98f72`                   | `#7b685c`                   | Warm secondary copy             |
| `--accent`          | `#ec824d`                   | `#ec824d`                   | Fills, borders, highlights      |
| `--accent-contrast` | `#101917`                   | `#101917`                   | Text on accent fills            |
| `--accent-text`     | `#ec824d`                   | `#ad4815`                   | Accessible accent-coloured text |
| `--accent-soft`     | `rgba(236, 130, 77, 0.22)`  | `rgba(236, 130, 77, 0.20)`  | Subtle accent surfaces          |
| `--accent-blue`     | `#1e493d`                   | `#1e493d`                   | Racing-green secondary accent   |
| `--panel`           | `rgba(23, 41, 36, 0.78)`    | `rgba(250, 244, 233, 0.84)` | Primary translucent surface     |
| `--panel-secondary` | `rgba(248, 236, 219, 0.08)` | `rgba(245, 236, 222, 0.78)` | Nested surfaces                 |
| `--panel-subtle`    | `rgba(30, 73, 61, 0.24)`    | `rgba(30, 73, 61, 0.09)`    | Quiet fills                     |
| `--panel-dark`      | `#08110f`                   | `#17342c`                   | Dark media/CTA surfaces         |
| `--panel-dark-mid`  | `#1e493d`                   | `#22443a`                   | Dark gradient endpoint          |
| `--line`            | `rgba(242, 233, 219, 0.10)` | `rgba(30, 73, 61, 0.14)`    | Borders and dividers            |
| `--focus-ring`      | `#ec824d`                   | `#ad4815`                   | Keyboard focus indicator        |

Semantic state tokens are theme-safe aliases:

| Role    | Fill/border token | Text token       |
| ------- | ----------------- | ---------------- |
| Error   | `--error`         | `--error-text`   |
| Success | `--success`       | `--success-text` |
| Warning | `--warning`       | `--warning-text` |

Use semantic Tailwind aliases such as `bg-background`, `text-muted`,
`border-line`, and `text-accent-text`. Do not introduce raw brand colours in
components. `--accent` is intended for fills and decoration; use
`--accent-text` when the accent is foreground text on a page or panel.

## 2. Typography

Fonts are loaded with `next/font` in `app/layout.tsx`.

| CSS variable     | Family           | Weights | Primary use                          |
| ---------------- | ---------------- | ------- | ------------------------------------ |
| `--font-display` | Bodoni Moda      | 400–700 | Headlines and editorial display type |
| `--font-sans`    | Barlow Condensed | 300–700 | Body copy, navigation, forms, UI     |
| `--font-mono`    | IBM Plex Mono    | 400–500 | Indices, years, technical metadata   |

The body receives `font-[family-name:var(--font-sans)]`. Apply the display font
with `font-[family-name:var(--font-display)]`; Tailwind's arbitrary-value type
hint must be `family-name:`.

### Display patterns

| Pattern                     | Size                                         | Leading              | Tracking                 |
| --------------------------- | -------------------------------------------- | -------------------- | ------------------------ |
| `SplitHeadline`             | `clamp(2.75rem, 13vw, 7rem)`                 | `0.88`               | `-0.04em`                |
| `.project-display-title`    | `clamp(2.8rem, 6.4vw, 5.5rem)`               | Component sets `0.9` | Component sets `-0.05em` |
| `.description-copy`         | `clamp(1rem, 0.965rem + 0.22vw, 1.125rem)`   | `1.8`                | Default                  |
| `.description-copy-compact` | `clamp(0.95rem, 0.925rem + 0.16vw, 1.05rem)` | `1.7`                | Default                  |

Section headings use responsive Tailwind sizes local to their component. This
is intentional: the system has named display patterns rather than a global
HTML-heading scale.

### Letter spacing

| Tailwind class     | Value    | Use                          |
| ------------------ | -------- | ---------------------------- |
| `tracking-ui`      | `0.20em` | Buttons, pills, controls     |
| `tracking-meta`    | `0.26em` | Metadata and captions        |
| `tracking-eyebrow` | `0.30em` | Section eyebrows             |
| `tracking-wide`    | `0.34em` | Special compact display text |

Display type normally uses negative tracking. Body copy keeps the default
tracking for readability.

## 3. Layout and spacing

### Shared section utilities

| Class                   | Mobile  | `sm`    | `lg`    |
| ----------------------- | ------- | ------- | ------- |
| `.section-shell`        | `px-4`  | `px-8`  | `px-10` |
| `.section-space`        | `py-14` | `py-16` | `py-20` |
| `.section-space-medium` | `py-10` | `py-12` | `py-14` |
| `.section-space-tight`  | `py-8`  | `py-8`  | `py-10` |

`.section-shell` is centred and capped at `1440px`. Sections that visually
continue the preceding section commonly add `pt-0` so two vertical paddings do
not stack.

Common responsive compositions include:

| Pattern         | Typical classes                               | Use           |
| --------------- | --------------------------------------------- | ------------- |
| Editorial split | `lg:grid-cols-[0.9fr_1.1fr]`                  | Featured work |
| Hero split      | `xl:grid-cols-[0.95fr_1.05fr]`                | Home hero     |
| Service row     | `lg:grid-cols-[140px_1fr_0.9fr]`              | Service index |
| Project grid    | `md:grid-cols-2 xl:grid-cols-3`               | Work index    |
| Footer          | `sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]` | Public footer |

The project uses Tailwind's standard breakpoints: `sm` 640px, `md` 768px,
`lg` 1024px, `xl` 1280px, and `2xl` 1536px.

Safe-area utilities (`.safe-area-top`, `.mobile-navigation-panel`,
`.site-footer-safe-area`, `.lightbox-safe-area`, and `.lightbox-close-safe`)
must be used for fixed or edge-aligned UI. The admin site preview uses a named
inline-size container; layouts marked with `data-preview-stack` collapse from
the simulated preview width rather than the surrounding browser width.

## 4. Surfaces, borders, and shadows

| Class/token     | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `.glass-panel`  | Theme panel with border, inset highlight, shadow, and blur    |
| `.panel-2xl`    | Responsive rounded glass-panel composition                    |
| `.dark-panel`   | Dark theme-token gradient with a restrained accent glow       |
| `.film-frame`   | Media frame with layered highlight, vignette, and deep shadow |
| `.texture-grid` | Page-level grid texture driven by `--grid-line`               |
| `.grain`        | Decorative film-grain overlay                                 |
| `.divider`      | One-pixel semantic divider                                    |
| `shadow-halo`   | `0 24px 100px rgba(15, 23, 32, 0.12)`                         |
| `shadow-card`   | `0 16px 60px rgba(17, 24, 28, 0.12)`                          |

Border radii are proportional to component size: pills use `rounded-full`,
inputs use `rounded-2xl`, cards typically use `1.25rem`–`2rem`, and major
editorial panels may use `2.5rem`.

## 5. Shared component classes

### Metadata and typography

| Class                     | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `.eyebrow`                | Small uppercase section label with an accent rule      |
| `.metadata-grid`          | Three-column metadata with horizontal dividers         |
| `.metadata-grid-cards`    | Three-column metadata card grid                        |
| `.metadata-card`          | Individual nested metadata surface                     |
| `.metadata-label`         | Compact muted label                                    |
| `.metadata-value`         | Standard metadata value                                |
| `.metadata-value-compact` | Uppercase compact metadata value                       |
| `.metadata-number`        | Monospace accent index                                 |
| `.split-trail-underline`  | Accent gradient underline triggered by `.group-reveal` |

### Forms and controls

| Class             | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `.input-field`    | Minimum 44px text/select control with semantic focus border |
| `.textarea-field` | Multiline equivalent of `.input-field`                      |
| `.field-error`    | Error-border modifier                                       |
| `.action-button`  | Primary form action                                         |
| `.control-pill`   | Interactive secondary control                               |
| `.muted-pill`     | Non-primary pill treatment                                  |
| `.toggle-row`     | Label/control row on a nested panel                         |

All interactive controls must retain at least a 44px touch target where their
layout permits it. Error messages use `FieldError` and connect to their field
with `aria-describedby`.

## 6. Media and content gates

- Public project images use a neutral branded poster if the configured asset
  cannot be delivered. Alt text describes the project subject and location;
  captions remain separate visible copy.
- Team portraits and the team gallery require real team photography. Legacy
  `/images/demo-car-*` placeholders are deliberately hidden on the public
  About page and must not be described as people. Supply approved portraits
  through Site Settings before expecting the Team section to appear.
- Native video metadata belongs at the top of the frame so it cannot obscure
  browser playback controls. External embeds own their consent and playback UI.
- A selected still always opens its lightbox. A related project, when present,
  is a separate, explicitly labelled link.

## 7. Motion

Shared Framer Motion values live in `lib/motion.ts`:

| Name      | Duration |
| --------- | -------- |
| `micro`   | `0.16s`  |
| `state`   | `0.22s`  |
| `content` | `0.38s`  |
| `hero`    | `0.60s`  |

The shared ease is `[0.22, 1, 0.36, 1]`.

`ThemeProvider` supplies `LazyMotion` with `domAnimation` and
`MotionConfig reducedMotion="user"`. Components use `m`, not `motion`, to keep
the feature bundle lazy.

### Reveal

`Reveal` is a translate-in entrance, not a fade. Opacity stays at `1` so
content remains visible and stable during hydration.

| Variant   | Offset | Duration | Typical use                |
| --------- | ------ | -------- | -------------------------- |
| `subtle`  | 18px   | `0.38s`  | Dense lists and grids      |
| `default` | 30px   | `0.48s`  | Standard sections          |
| `bold`    | 44px   | `0.55s`  | Featured editorial content |

Horizontal offsets are capped at 16px to avoid widening narrow viewports.
After the entrance completes, `Reveal` adds `.group-reveal` for sequenced child
effects such as the split-headline underline.

### Reduced motion

Reduced motion is enforced at three levels:

1. `MotionConfig reducedMotion="user"` handles Framer transform/layout motion.
2. The CSS media query disables marquee, shake, pulse, smooth scrolling, and
   press transforms.
3. Components disable non-Framer behaviour such as smooth programmatic
   scrolling and hero-video autoplay.

Use `useHydratedReducedMotion` when the preference changes the rendered React
tree and the server must match the first client render. Direct
`useReducedMotion` remains appropriate when the value only configures motion or
must prevent a browser effect on the first client commit, as in the hero video.

### On-demand overlays

The image lightbox is dynamically imported by `ProjectImageCarousel` and
`SelectedFrames`. It is not rendered until the user opens it for the first
time; after that it remains mounted so its close animation and focus
restoration continue to work.

## 8. UI components

### `LinkButton`

Variants: `primary`, `secondary`, and `ghost`. All variants provide a minimum
touch target, uppercase UI type, active press feedback, and the shared
ArrowUpRight treatment.

### `SplitHeadline`

Accepts `lead`, `trail`, optional `eyebrow`, optional `copy`, `align`, and
`className`. The trail uses `text-accent-text`, not `text-accent`, for theme
contrast.

### `MetadataGrid`

Accepts metadata `items`, `variant: "divider" | "cards"`, and optional class
overrides for the container, labels, and values.

### `RevealList`

Maps data to staggered `Reveal` wrappers. `itemClassName` may be a string or a
function of `(item, index)`. The parent owns the grid or flex layout.

### `ContactInfo`

Renders non-empty email, phone, and city values from `SiteSettings`. The
optional `showIcons` variant is used on the contact page; the footer uses the
text-only variant.

### `Lightbox`

Provides an accessible named dialog, focus trapping and restoration,
Escape/arrow-key controls, live image counts, and optional fallback images.
Callers own the active index.

## 9. Interaction and accessibility

- Global focus-visible styling uses a two-layer ring based on
  `--background` and `--focus-ring`.
- The public shell starts with a skip link targeting `#main-content`.
- The mobile navigation and lightbox use `useFocusTrapDialog` for initial
  focus, Tab wrapping, Escape handling, scroll locking, and focus restoration.
- Theme text contrast uses `--accent-text` and the semantic `*-text` tokens.
- Images require meaningful alt text unless they are intentionally decorative.
- Status updates and carousel counts use polite live regions where relevant.
- Automated Axe coverage runs across public routes in both themes and includes
  the mobile menu, validation errors, lightbox, and admin workspace.

## 10. Application structure

```text
RootLayout
├── theme initialisation script
├── ThemeProvider
└── PublicSiteLayout
    ├── organisation structured data
    ├── skip link
    ├── SiteHeader
    ├── Template
    │   └── <main id="main-content">
    └── SiteFooter
```

Routes under `app/(site)` inherit the public shell. The root not-found route
assembles the same header/footer explicitly because it sits outside that route
group. Public page data and metadata come from the CMS-backed site settings.

## 11. Change checklist

When changing the visual system:

1. Update runtime tokens or classes in `app/globals.css`.
2. Update IDs/defaults in `lib/themes.ts` if theme behaviour changes.
3. Update Tailwind aliases only when a reusable semantic name is needed.
4. Exercise both themes, mobile and desktop layouts, keyboard focus, and
   reduced-motion mode.
5. Update this document in the same change.

Relevant local checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run bundle:check
npm run test:e2e
```
