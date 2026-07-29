export type ThemeId = "vintage-light" | "gpt-vintage";

export interface Theme {
  id: ThemeId;
  label: string;
  bg: string;
  accent: string;
  secondaryAccent: string;
  accentContrast: string;
  dark: boolean;
}

export const themes: Theme[] = [
  {
    id: "vintage-light",
    label: "Vintage Light",
    bg: "#f3eadb",
    accent: "#EC824D",
    secondaryAccent: "#1E493D",
    accentContrast: "#101917",
    dark: false
  },
  {
    id: "gpt-vintage",
    label: "Vintage Dark",
    bg: "#14211d",
    accent: "#EC824D",
    secondaryAccent: "#1E493D",
    accentContrast: "#101917",
    dark: true
  }
];

export const VINTAGE_LIGHT_THEME: ThemeId = "vintage-light";
export const VINTAGE_DARK_THEME: ThemeId = "gpt-vintage";
export const DEFAULT_THEME: ThemeId = VINTAGE_DARK_THEME;

export const themeIds: ThemeId[] = [VINTAGE_LIGHT_THEME, VINTAGE_DARK_THEME];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return typeof value === "string" && themeIds.includes(value as ThemeId);
}

export function resolveTheme(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME;
}
