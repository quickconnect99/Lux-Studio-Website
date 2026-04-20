export type ThemeId =
  | "cream"
  | "vintage-light"
  | "vintage"
  | "gpt-vintage"
  | "obsidian"
  | "carbon"
  | "arctic"
  | "amber"
  | "midnight-racing"
  | "titanium"
  | "asphalt"
  | "glacier"
  | "bloodline";

export interface Theme {
  id: ThemeId;
  label: string;
  bg: string;
  accent: string;
  secondaryAccent?: string;
  accentContrast: string;
  dark: boolean;
}

export const themes: Theme[] = [
  { id: "cream",           label: "Cream",     bg: "#f4f1ea", accent: "#9eff4f", accentContrast: "#1b232b", dark: false },
  { id: "vintage-light",   label: "Vintage Light", bg: "#f3eadb", accent: "#EC824D", secondaryAccent: "#1E493D", accentContrast: "#f7efe2", dark: false },
  { id: "vintage",         label: "Vintage Dark",  bg: "#17120f", accent: "#EC824D", secondaryAccent: "#1E493D", accentContrast: "#17120f", dark: true },
  { id: "gpt-vintage",     label: "GPT Vintage",   bg: "#14211d", accent: "#EC824D", secondaryAccent: "#1E493D", accentContrast: "#1E493D", dark: true },
  { id: "obsidian",        label: "Obsidian",  bg: "#0c0f12", accent: "#9eff4f", accentContrast: "#0c0f12", dark: true },
  { id: "carbon",          label: "Carbon",    bg: "#141518", accent: "#ff3b3b", accentContrast: "#0c0f12", dark: true },
  { id: "arctic",          label: "Arctic",    bg: "#f8f9fb", accent: "#2563eb", accentContrast: "#f8f9fb", dark: false },
  { id: "amber",           label: "Amber",     bg: "#111008", accent: "#f0a500", accentContrast: "#111008", dark: true },
  { id: "midnight-racing", label: "Midnight",  bg: "#070d1a", accent: "#00d4ff", accentContrast: "#070d1a", dark: true },
  { id: "titanium",        label: "Titanium",  bg: "#f2f2f4", accent: "#7c3aed", accentContrast: "#f2f2f4", dark: false },
  { id: "asphalt",         label: "Asphalt",   bg: "#1c1a17", accent: "#ff6a1a", accentContrast: "#1c1a17", dark: true },
  { id: "glacier",         label: "Glacier",   bg: "#f0f5f4", accent: "#00c896", accentContrast: "#0e1f1c", dark: false },
  { id: "bloodline",       label: "Bloodline", bg: "#0d0a0a", accent: "#c41230", accentContrast: "#f0ebe8", dark: true },
];

export const DEFAULT_THEME: ThemeId = "cream";

export const themeIds = themes.map((theme) => theme.id);

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return typeof value === "string" && themeIds.includes(value as ThemeId);
}

export function resolveTheme(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME;
}
