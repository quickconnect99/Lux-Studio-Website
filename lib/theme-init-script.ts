import { createHash } from "node:crypto";
import { DEFAULT_THEME, themeIds } from "@/lib/themes";

export const themeInitScript = `(function(){try{var allowed=${JSON.stringify(themeIds)};var stored=localStorage.getItem("theme");var theme=allowed.indexOf(stored)!==-1?stored:${JSON.stringify(DEFAULT_THEME)};document.documentElement.setAttribute("data-theme",theme);}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(DEFAULT_THEME)});}})();`;

export const themeInitScriptSha256 = `sha256-${createHash("sha256")
  .update(themeInitScript)
  .digest("base64")}`;
