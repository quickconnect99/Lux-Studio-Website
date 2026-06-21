# Technical Roadmap

Stand: 19. Juni 2026

## Ziel

Die Website soll im Produktionsbetrieb keine Demo-Daten vortäuschen, den
Admin-Bereich nach dem Least-Privilege-Prinzip schützen und verlässlich über
automatisierte Checks deploybar sein.

## Phase 0 — Repository-Datenschutz

Priorität: kritisch

- Rechnungen und andere private Dokumente aus dem Git-Index entfernen.
- Dateimuster für private Dokumente in `.gitignore` aufnehmen.
- Prüfen, ob die Dateien bereits zu einem Remote gepusht wurden.
- Falls ja: Git-Historie mit `git filter-repo` bereinigen und betroffene
  Zugangsdaten bzw. personenbezogene Informationen als offengelegt behandeln.

Akzeptanzkriterien:

- `git ls-files` listet keine Rechnungen oder privaten Dokumente.
- Neue PDF-Rechnungen können nicht versehentlich committed werden.
- Die Historienbereinigung wurde mit allen Repository-Nutzern koordiniert.

## Phase 1 — Korrektheit und Zugriffsschutz

Priorität: hoch

- Lokale Demo-Projekte nur verwenden, wenn Supabase nicht konfiguriert ist.
- Datenbankfehler protokollieren, aber keine gelöschten Demo-Projekte
  reaktivieren.
- Supabase-Login gegen die explizite Admin-Allowlist pruefen.
- RLS und Storage-Policies auf eine explizite Admin-Allowlist begrenzen.

Akzeptanzkriterien:

- Ein in Supabase fehlender Slug liefert `notFound` und keinen Demo-Datensatz.
- Ein angemeldeter, aber nicht freigeschalteter Supabase-User sieht keinen Editor.
- Ein normaler authentifizierter Supabase-User kann keine CMS-Daten verändern.

## Phase 2 — Toolchain und CI

Priorität: hoch

- Next.js und `eslint-config-next` auf dieselbe Major-/Minor-Linie bringen.
- Node.js 20.19 oder neuer als lokale und CI-Runtime verwenden.
- ESLint-Ignores und TypeScript-Projektanalyse so konfigurieren, dass
  generierte und nicht auslieferbare Dateien nicht analysiert werden.
- CI-Schritte für Typecheck, Lint, Tests und Build ergänzen.

Akzeptanzkriterien:

- `npm run typecheck`, `npm run lint`, `npm test` und `npm run build` laufen
  reproduzierbar.
- Lint analysiert nur produktiven Quellcode und Konfiguration.

## Phase 3 — Admin-Refactoring

Priorität: mittel

`use-admin-data.ts` wird schrittweise zerlegt in:

- Auth-Session
- Projekt-Laden und CRUD
- Upload-Warteschlange
- Draft-Persistenz
- Site-Settings

`site-settings-form.tsx` wird nach Inhaltsbereichen in Teilformulare zerlegt.
Die bestehenden Form-State-Typen bleiben zunächst die Integrationsgrenze, um
ein Big-Bang-Refactoring zu vermeiden.

Akzeptanzkriterien:

- Kein Admin-Hook bündelt Auth, Storage, CRUD und UI-Dialoge gleichzeitig.
- Extrahierte Logik ist ohne React-Komponenten testbar.
- Verhalten und gespeicherte Payloads bleiben kompatibel.

## Phase 4 — Tests und Betrieb

Priorität: mittel

- Unit-Tests für Inquiry-Validierung, Slugs, Berechtigungen und Rate-Limits.
- Integrationstests für Supabase-Fallbacks und Berechtigungen.
- Persistentes Rate-Limit über Upstash/Vercel KV oder eine Supabase-RPC
  einführen; In-Memory-Limits bleiben nur eine lokale Zusatzbarriere.
- Fehler-Monitoring für fehlgeschlagene Supabase-Abfragen ergänzen.

Akzeptanzkriterien:

- Kritische Auth- und Fallback-Pfade sind automatisiert abgedeckt.
- Rate-Limits funktionieren über mehrere Serverless-Instanzen hinweg.
- Produktionsfehler sind sichtbar und werden nicht still durch Demo-Inhalte
  verdeckt.
