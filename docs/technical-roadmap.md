# Technische Roadmap

Stand: 26. Juli 2026

## Zielbild

Die Website soll reproduzierbar deploybar, auf kleinen und großen Viewports
stabil, für Tastatur und Touch bedienbar und im Produktionsbetrieb
beobachtbar sein. Der Admin-Bereich wird schrittweise modularisiert, ohne die
bestehenden Payloads oder den redaktionellen Workflow in einem Big-Bang-Umbau
zu verändern.

## Status-Legende

- `Erledigt`: im Repository umgesetzt und lokal verifiziert
- `In Arbeit`: lokal umsetzbarer Schritt dieser Iteration
- `Gate`: benötigt eine bewusste Freigabe oder Änderung externer Infrastruktur
- `Geplant`: sinnvoller Folgeschritt ohne akuten Produktionsblocker

## Phase 0 — Repository-Datenschutz

Status: `Gate`

Priorität: kritisch

- Rechnungen und andere private Dokumente dürfen nicht im Git-Index liegen.
- Dateimuster für private Dokumente bleiben in `.gitignore`.
- Falls private Dateien bereits gepusht wurden, muss eine koordinierte
  Historienbereinigung mit `git filter-repo` erfolgen.
- Betroffene Zugangsdaten und personenbezogene Informationen sind dann als
  offengelegt zu behandeln.

Akzeptanzkriterien:

- `git ls-files` listet keine Rechnungen oder privaten Dokumente.
- Neue PDF-Rechnungen können nicht versehentlich committed werden.
- Eine notwendige Historienbereinigung wurde mit allen Repository-Nutzern
  abgestimmt.

Freigabe-Gate:

- Git-Historie nicht automatisch umschreiben. Das betrifft alle Klone und
  benötigt ein koordiniertes Wartungsfenster.

## Phase 1 — Korrektheit und Zugriffsschutz

Status: `Erledigt`, Produktionsschema bleibt ein `Gate`

Priorität: hoch

- Lokale Demo-Projekte werden nur verwendet, wenn Supabase nicht konfiguriert
  ist.
- Datenbankfehler reaktivieren keine gelöschten Demo-Projekte.
- Supabase-Login und Schreiboperationen verwenden die explizite
  Admin-Allowlist.
- Admin-Revalidierung prüft die Session serverseitig.
- RLS und Storage-Policies begrenzen Änderungen auf freigeschaltete
  Admin-Konten.

Akzeptanzkriterien:

- Ein in Supabase fehlender Slug liefert `notFound`.
- Ein angemeldeter, aber nicht freigeschalteter User sieht keinen Editor.
- Ein normaler authentifizierter User kann keine CMS-Daten verändern.
- `/admin` ist im Produktions-Build ohne explizite Aktivierung nicht
  erreichbar.

Freigabe-Gate:

- Änderungen in `supabase/schema.sql` müssen vor dem Livegang auf das
  Produktionsprojekt angewendet und dort mit einem Nicht-Admin-Konto geprüft
  werden.

## Phase 2 — Toolchain und automatisierte Qualität

Status: `Erledigt`

Priorität: hoch

- Node.js 20.19 oder neuer ist über `.nvmrc` festgelegt.
- Next.js und `eslint-config-next` verwenden dieselbe Version.
- CI führt Typecheck, Lint, Unit-Tests und Build aus.
- Eine Playwright-Suite prüft die öffentlichen Routen und den lokalen
  Admin-Bereich bei 320, 390, 768 und 1440 Pixel Breite.
- Browserfehler, fehlende Hauptüberschriften, kaputte Bilder und horizontaler
  Overflow führen zu einem Testfehler.
- Menü, Theme-Auswahl und Reduced-Motion-Hydration erhalten eigene
  Interaktionstests.

Akzeptanzkriterien:

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` und
  `npm run build` laufen reproduzierbar.
- CI installiert nur Chromium und speichert Playwright-Artefakte bei Fehlern.
- Browser-Screenshots, Traces und Reports werden nicht committed.

## Phase 3 — Responsive GUI und Barrierearmut

Status: `Erledigt`, anschließend kontinuierliche Qualitätssicherung

Priorität: hoch

- Animationszustände sind zwischen Server und erster Client-Ausgabe stabil.
- Horizontale Reveal-Animationen überschreiten auf kleinen Displays nicht den
  Seitengutter.
- Jede öffentliche Inhaltsseite besitzt genau eine Hauptüberschrift.
- Mobile Navigation, Theme-Menü und Admin-Dialoge sind per Tastatur bedienbar.
- Wesentliche Form-, Drag-, Lösch- und Navigationsaktionen verwenden
  touchfreundliche Trefferflächen.
- Viewportgebundene Overlays werden nicht von transformierten oder
  backdrop-gefilterten Vorfahren abgeschnitten.

Akzeptanzkriterien:

- Kein horizontaler Dokument-Overflow in den definierten Viewports.
- Keine Hydration- oder Konsolenfehler bei normaler oder reduzierter Bewegung.
- Mobile Overlays bleiben vollständig innerhalb des Viewports.

## Phase 4 — Admin-Modularisierung und Bundle

Status: zwei Iterationen `Erledigt`, Folgeiteration `Geplant`

Priorität: mittel

Bereits getrennte Integrationsgrenzen:

- Medienauswahl und Vorschau-URLs: `use-admin-media.ts`
- Browser-Drafts: `use-admin-draft.ts`
- Formularzustand: `use-form.ts`
- Datenbank-Payloads und Normalisierung: `admin-persistence.ts`
- Site-Settings-Oberfläche: nach Inhaltsbereichen aufgeteilt

Diese Iteration:

- Auth-Session und Session-Lifecycle aus `use-admin-data.ts` extrahieren.
- Schwere Admin-Editoren und Vorschauen dynamisch laden.
- Loading-Zustände so gestalten, dass Layout und Fokus stabil bleiben.
- Reine Logik an Modulgrenzen mit Unit-Tests absichern.

Zweite Iteration:

- Site-Settings-Formularzustand, Laden und Speichern in
  `use-admin-site-settings.ts` kapseln.
- Storage-Uploads und öffentliche Revalidierung aus dem UI-Hook in
  `admin-storage.ts` verschieben.
- Projekt-Laden, Upsert und Löschen über `admin-project-repository.ts`
  abstrahieren.
- Zusammenführen lokaler Projekte ohne Datenbank-ID mit Unit-Tests absichern.

Geplante Folgeiteration:

- Projektauswahl, Slug-Prüfung und Bestätigungsdialoge in einen
  `use-admin-project-workspace`-Hook überführen.
- Mutationsergebnisse und Repository-Fehler über typisierte Resultate statt
  über verteilte Status-Strings transportieren.
- `use-admin-data.ts` anschließend als kleinen Orchestrator beibehalten oder
  durch einen Admin-Context ersetzen.

Akzeptanzkriterien:

- Auth, Media-Queue, Draft-Persistenz und Site-Settings liegen nicht mehr im
  zentralen Hook.
- Projekt-CRUD greift nur über das Repository auf Supabase zu.
- Settings-Code wird beim initialen Projekt-Editor nicht zwingend geladen.
- Bestehende Datenbank- und lokale Payloads bleiben kompatibel.
- Der Admin-Build wird nicht größer; Änderungen der Chunk-Größen werden im
  Build-Report dokumentiert.

## Phase 5 — Produktionshärtung und Beobachtbarkeit

Status: im Repository `Erledigt`, Produktionsmigration und externer
Monitoring-Anbieter sind `Gates`

Priorität: mittel

- Das Inquiry-Rate-Limit erhält einen persistenten Supabase-RPC-Pfad.
- Falls die Migration noch nicht aktiv ist, bleibt das lokale In-Memory-Limit
  als klar protokollierter Fallback erhalten.
- Serverfehler werden strukturiert und ohne Formulardaten oder Geheimnisse
  protokolliert.
- Anfrage-, Supabase- und E-Mail-Fehler erhalten stabile Event-Namen und eine
  Request-ID.

Akzeptanzkriterien:

- Mit angewendetem Schema funktioniert das Limit über mehrere
  Serverless-Instanzen hinweg.
- Ein fehlender RPC führt nicht zum Ausfall des Kontaktformulars.
- Logs enthalten keine E-Mail-Adresse, keinen Nachrichtentext und keine
  Zugangsdaten.
- Kritische Fehler sind anhand von Event-Name und Request-ID korrelierbar.

Freigabe-Gate:

- Ein externer Anbieter wie Sentry, Axiom oder Datadog benötigt
  Anbieterentscheidung, Account, Datenregion und Secret-Konfiguration.

## Phase 6 — Dependency- und Framework-Migration

Status: `Gate`

Priorität: mittel

- Direkte Sicherheitsupdates innerhalb der aktuellen Next-Linie werden
  zeitnah eingespielt.
- Verbleibende transitive `postcss`-/`sharp`-Findings werden in einer
  kontrollierten Next-Major-Migration aufgelöst.
- Die Migration umfasst Codemods, Build, Unit-/E2E-Tests und einen
  Preview-Deploy.

Akzeptanzkriterien:

- Kein ungeprüfter `npm audit fix --force`.
- Keine offenen hohen Production-Advisories.
- Öffentliche Seiten, Admin-Workflow und Supabase-Revalidierung bestehen die
  vollständige Regression.

Freigabe-Gate:

- Framework-Major-Upgrades werden in einem eigenen Branch und mit
  Preview-Deployment durchgeführt.

## Empfohlene Reihenfolge

1. Phase 2 und die aktuelle Iteration aus Phase 4 abschließen.
2. Persistenten Rate-Limit-Pfad und strukturierte Logs aus Phase 5 aktivieren.
3. Supabase-Migration im Produktionsprojekt anwenden und testen.
4. Projekt-CRUD und Settings-Mutationen weiter aus dem Admin-Orchestrator
   extrahieren.
5. Monitoring-Anbieter auswählen.
6. Next-Major-Migration separat planen und über einen Preview-Deploy
   freigeben.
