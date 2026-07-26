# Next.js-Major-Bewertung

Stand: 26. Juli 2026

## Entscheidung

Die Migration von Next.js 15 auf 16 ist technisch überschaubar, wird aber
nicht direkt auf `main` durchgeführt. Sie bleibt ein Freigabe-Gate, bis ein
eigener Upgrade-Branch und ein Preview-Deployment verfügbar sind. Zusätzlich
ist derzeit nicht belegt, dass der Major-Wechsel die offenen transitiven
Production-Advisories beseitigt.

## Verifizierte Ausgangslage

- `package.json` erlaubt Next.js `^15.5.21`; installiert ist `15.5.22`.
- Der npm-Tag `backport` zeigt auf `15.5.22`.
- Der npm-Tag `latest` zeigt auf `16.2.12`.
- React und React DOM sind lokal auf `19.2.4` aufgelöst.
- `.nvmrc` legt Node.js `20.19.0` fest und erfüllt damit die
  Mindestanforderung von Next.js 16.
- Die Anwendung verwendet den App Router.

Offizielle Referenzen:

- [Next.js-16-Upgrade-Anleitung](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Next.js Security Advisories](https://github.com/vercel/next.js/security/advisories)
- [Next.js Security Release vom Juli 2026](https://nextjs.org/blog)

## Lokaler Kompatibilitätscheck

Kein unmittelbarer Blocker:

- Keine synchrone Verwendung von `cookies()`, `headers()` oder `draftMode()`
  im Anwendungscode.
- Keine eigene Webpack-Konfiguration; der Wechsel zu Turbopack als
  Standard-Bundler ist daher grundsätzlich möglich.
- Kein `next/legacy/image`.
- ESLint wird bereits direkt über die ESLint-CLI gestartet.

Erforderliche Anpassung:

- Next.js 16 erlaubt bei `next/image` standardmäßig nur Qualität `75`.
  Diese Anwendung nutzt zusätzlich `90` und `95`. Vor der Migration ist in
  `next.config.mjs` daher `images.qualities: [75, 90, 95]` zu setzen.

## Security-Gate

`npm audit --omit=dev` meldet im aktuellen Installationsbaum:

- `postcss@8.4.31` unter `next`: hoch
- `sharp@0.34.5`: hoch
- `next` als betroffene direkte Abhängigkeit: hoch

In Summe sind es drei hohe Production-Findings und keine kritischen Findings.
Der automatische npm-Vorschlag verweist auf Next.js `9.3.3` und ist weder
semantisch noch sicherheitstechnisch akzeptabel. Deshalb wird kein
`npm audit fix --force` ausgeführt.

Vor der Freigabe muss im Upgrade-Branch erneut geprüft werden:

1. Welche Versionen Next.js 16 tatsächlich auflöst.
2. Ob eine offizielle gepatchte Next-Version verfügbar ist.
3. Ob ein dokumentiertes, kompatibles Override erforderlich und vom
   Framework-Hersteller gedeckt ist.
4. Ob `npm audit --omit=dev` ohne hohe Findings endet oder eine formale,
   zeitlich begrenzte Risikofreigabe vorliegt.

## Umsetzungscheckliste im Upgrade-Branch

1. Branch von einem sauberen, gepushten `main` erstellen.
2. Offiziellen Next-Codemod für Version 16 ausführen.
3. Next.js, `eslint-config-next`, React, React DOM und React-Typen gemeinsam
   aktualisieren.
4. `images.qualities: [75, 90, 95]` ergänzen.
5. Typecheck, Lint, Unit-Tests und Production-Build ausführen.
6. Die komplette Playwright-Matrix bei 320, 390, 768 und 1440 Pixel ausführen.
7. Öffentliche Routen, Admin-CRUD, Supabase-Revalidierung und
   Bildoptimierung im Preview-Deployment prüfen.
8. Production-Audit dokumentieren und erst danach mergen.
