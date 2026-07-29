import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports"
        }
      ]
    }
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "public/**",
    "car pictures/**",
    "_Test Material/**",
    "*.tsbuildinfo",
    "playwright-report/**",
    "test-results/**"
  ])
]);

export default config;
