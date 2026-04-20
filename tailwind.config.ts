import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      /* ─── Colour tokens ─────────────────────────────────────────── */
      colors: {
        background:    "var(--background)",
        foreground:    "var(--foreground)",
        muted:         "var(--muted)",
        "muted-warm":  "var(--muted-warm)",
        accent:        "var(--accent)",
        "accent-contrast": "var(--accent-contrast)",
        "accent-soft": "var(--accent-soft)",
        "accent-blue": "var(--accent-blue)",
        panel:         "var(--panel)",
        "panel-secondary": "var(--panel-secondary)",
        "panel-subtle":    "var(--panel-subtle)",
        "panel-dark":      "var(--panel-dark)",
        "panel-dark-mid":  "var(--panel-dark-mid)",
        line:          "var(--line)",
        error:         "var(--error)",
        success:       "var(--success)",
        warning:       "var(--warning)"
      },

      /* ─── Letter-spacing scale ──────────────────────────────────── */
      // Named by intent so components can change meaning without
      // hunting for raw em values across the codebase.
      letterSpacing: {
        ui:      "0.20em", // buttons, pills, control labels
        meta:    "0.26em", // metadata labels, captions
        eyebrow: "0.30em", // section eyebrows
        wide:    "0.34em"  // special accent text
      },

      /* ─── Shadows ───────────────────────────────────────────────── */
      boxShadow: {
        halo: "0 24px 100px rgba(15, 23, 32, 0.12)",
        card: "0 16px 60px rgba(17, 24, 28, 0.12)"
      },

      /* ─── Background images ─────────────────────────────────────── */
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 18%, transparent), transparent 40%), " +
          "radial-gradient(circle at 80% 15%, color-mix(in srgb, var(--accent-blue) 14%, transparent), transparent 30%), " +
          "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(247,245,239,0.86) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
