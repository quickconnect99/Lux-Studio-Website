# Next.js-Major-Upgrade

Stand: 28. Juli 2026

## Ergebnis

Das Repository ist auf Next.js `16.2.12`, React `19.2.8` und React DOM
`19.2.8` aktualisiert. Der Produktions-Build verwendet Turbopack und ist
erfolgreich. `.nvmrc` bleibt auf Node.js `20.19.0`, womit sowohl die
Next.js- als auch die Tooling-Anforderungen erfüllt sind.

Umgesetzte Anpassungen:

- ESLint verwendet die native Flat Config von `eslint-config-next`.
- `next/image` erlaubt explizit die verwendeten Qualitäten `75`, `90` und
  `95`; `priority` wurde durch `preload` ersetzt.
- Die durch React 19.2 aktivierten Ref- und Effect-Regeln sind ohne globale
  Deaktivierung erfüllt.
- Öffentliche Metadaten, JSON-LD und Supabase-Inhalte liegen nur noch im
  `(site)`-Layout. `/admin` bleibt davon unabhängig und wird dynamisch ohne ISR
  ausgeliefert.
- CI testet den zuvor erzeugten Produktions-Build statt eines Dev-Servers.

## Dependency-Sicherheit

`npm audit --omit=dev --audit-level=high` endet ohne bekannte
Produktions-Schwachstellen. Next.js `16.2.12` deklariert noch ältere
Unterabhängigkeiten, daher erzwingt `package.json` gezielt:

- `postcss@8.5.24`
- `sharp@0.35.3`

Der frühere, unbrauchbare npm-Vorschlag eines Downgrades auf Next.js `9.3.3`
wird ausdrücklich nicht verwendet. Die Overrides werden bei jedem
Framework-Update zusammen mit Build, Bildoptimierung und Production-Audit neu
geprüft.

## Offizielle Referenzen

- [Next.js-16-Upgrade-Anleitung](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Next.js ESLint-Konfiguration](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Next.js Image-Konfiguration](https://nextjs.org/docs/app/api-reference/components/image)

## Verifikation

Die Freigabekette umfasst Typecheck, ESLint, Unit-Tests, Migrationsprüfung,
Turbopack-Produktions-Build, Bundle-/Medienbudgets, Playwright über fünf
Displaygrößen, Axe WCAG A/AA sowie eine visuelle Desktop-Baseline.
