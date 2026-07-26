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

Status: lokal `Erledigt`, Remote-Aktualisierung bleibt ein `Gate`

Priorität: kritisch

- Rechnungen und andere private Dokumente dürfen nicht im Git-Index liegen.
- Dateimuster für private Dokumente bleiben in `.gitignore`.
- Falls private Dateien bereits gepusht wurden, muss eine koordinierte
  Historienbereinigung mit `git filter-repo` erfolgen.
- Betroffene Zugangsdaten und personenbezogene Informationen sind dann als
  offengelegt zu behandeln.

Audit und Bereinigung vom 26. Juli 2026:

- Im aktuellen Git-Index liegt nur `.env.example`; Rechnungen und echte
  Umgebungsdateien werden nicht getrackt.
- Aus sämtlichen lokalen Branch-, Remote-Tracking- und Stash-Referenzen wurden
  `car pictures/Rechnung_Handy.pdf`,
  `car pictures/Rechnung_Handy1.pdf` und
  `car pictures/Rechnung_Internet.pdf` entfernt.
- Die Dateien wurden nicht geöffnet oder inhaltlich verarbeitet.
- Alte Wiederherstellungsreferenzen und Reflogs wurden nach erfolgreicher
  Prüfung entfernt; die zugehörigen unerreichbaren Objekte wurden lokal
  bereinigt.

Akzeptanzkriterien:

- `git ls-files` listet keine Rechnungen oder privaten Dokumente.
- Neue PDF-Rechnungen können nicht versehentlich committed werden.
- Der bereinigte Branch wurde koordiniert force-gepusht und alle
  Repository-Nutzer haben ihre Klone anschließend neu aufgebaut.

Freigabe-Gate:

- Der lokale Rewrite ist abgeschlossen. Vor dem Force-Push auf GitHub muss ein
  Wartungsfenster mit allen Repository-Nutzern abgestimmt werden; vorhandene
  Klone dürfen die alte Historie danach nicht erneut pushen.

## Phase 1 — Korrektheit und Zugriffsschutz

Status: Repository und Produktionsschema `Erledigt`, Live-Workflow-Test bleibt
ein `Gate`

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

Deployment-Stand:

- Alle sieben versionierten Migrationen wurden am 26. Juli 2026 auf das
  verknüpfte Projekt „Lux Studio Website“ angewendet.
- Rate-Limit-Tabelle, RLS, RPC-Berechtigungen, Indizes, Projekt-Default und
  globale Kontaktadresse wurden anschließend read-only verifiziert.

Freigabe-Gate:

- Der vollständige Admin-Workflow muss vor dem Livegang zusätzlich mit einem
  echten Nicht-Admin-Konto im Browser geprüft werden.

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

Status: drei Iterationen `Erledigt`

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

Abgeschlossene dritte Iteration:

- Projektauswahl, Slug-Prüfung und Bestätigungsdialoge in einen
  `use-admin-project-workspace`-Hook überführen.
- Mutationsergebnisse und Repository-Fehler über typisierte Resultate statt
  über verteilte Status-Strings transportieren.
- Projekt-Laden, Slug-Lookup, Upsert und Löschen ausschließlich über das
  Projekt-Repository ausführen.
- Datenbankdetails gegenüber der GUI auf sichere, handlungsorientierte
  Fehlertypen abbilden.
- `use-admin-data.ts` als Orchestrator beibehalten; der Hook wurde dabei von
  869 auf 551 Zeilen reduziert.

Akzeptanzkriterien:

- Auth, Media-Queue, Draft-Persistenz und Site-Settings liegen nicht mehr im
  zentralen Hook.
- Projekt-CRUD greift nur über das Repository auf Supabase zu.
- Settings-Code wird beim initialen Projekt-Editor nicht zwingend geladen.
- Bestehende Datenbank- und lokale Payloads bleiben kompatibel.
- Änderungen der Admin-Chunk-Größe bleiben unter zwei Prozent und werden im
  Build-Report dokumentiert.

Bewusste Architekturentscheidung:

- Ein zusätzlicher globaler Admin-Context wird erst eingeführt, wenn mehrere
  voneinander unabhängige Admin-Routen denselben Zustand benötigen. Für die
  aktuelle einzelne Arbeitsfläche würde er nur eine weitere Indirektion
  erzeugen.

Build-Report:

- Vor der dritten Iteration: `/admin` 76,6 kB, First Load 227 kB.
- Danach: `/admin` 77,6 kB, First Load 228 kB.
- Die zusätzliche typisierte Fehler- und Workspace-Grenze kostet damit rund
  1 kB beziehungsweise 1,3 Prozent auf der nur explizit aktivierbaren
  Admin-Route. Die öffentlichen Routen werden dadurch nicht größer.

## Phase 5 — Produktionshärtung und Beobachtbarkeit

Status: Repository und Produktionsmigration `Erledigt`, externer
Monitoring-Anbieter bleibt ein `Gate`

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

Produktionsnachweis:

- `20260726000100_inquiry_rate_limit_and_defaults.sql` und
  `20260726000200_update_global_contact_email.sql` sind remote registriert.
- Ein transaktionaler Smoke-Test lieferte für zwei erlaubte und einen
  blockierten Versuch `[true, true, false]`; der Test wurde vollständig
  zurückgerollt.
- `anon` und `authenticated` besitzen kein Execute-Recht auf den RPC,
  `service_role` besitzt es.

Freigabe-Gate:

- Ein externer Anbieter wie Sentry, Axiom oder Datadog benötigt
  Anbieterentscheidung, Account, Datenregion und Secret-Konfiguration.

## Phase 6 — Dependency- und Framework-Migration

Status: lokal `Bewertet`, Major-Migration und Preview bleiben `Gates`

Priorität: mittel

- Direkte Sicherheitsupdates innerhalb der aktuellen Next-Linie werden
  zeitnah eingespielt.
- Verbleibende transitive `postcss`-/`sharp`-Findings werden in einer
  kontrollierten Next-Major-Migration aufgelöst.
- Die Migration umfasst Codemods, Build, Unit-/E2E-Tests und einen
  Preview-Deploy.

Ergebnis der Bewertung vom 26. Juli 2026:

- Installiert ist Next.js `15.5.22`, der aktuelle npm-Backport der
  Maintenance-LTS-Linie.
- Die aktuelle stabile Major-Linie ist Next.js `16.2.12`.
- Der Quellcode verwendet keine bei Next.js 16 entfernte synchrone
  Request-API und keine eigene Webpack-Konfiguration.
- Für Next.js 16 muss `images.qualities` mindestens die im Projekt verwendeten
  Werte `90` und `95` explizit erlauben.
- `npm audit --omit=dev` meldet weiterhin drei hohe transitive Findings in
  Nexts eingebundenem `postcss@8.4.31` und `sharp@0.34.5`. Die von npm
  vorgeschlagene automatische Abhilfe wäre ein falscher Downgrade auf
  Next.js 9 und wird nicht angewendet.
- Details und Migrationscheckliste stehen in
  `docs/next-major-assessment.md`.

Akzeptanzkriterien:

- Kein ungeprüfter `npm audit fix --force`.
- Keine offenen hohen Production-Advisories.
- Öffentliche Seiten, Admin-Workflow und Supabase-Revalidierung bestehen die
  vollständige Regression.

Freigabe-Gate:

- Framework-Major-Upgrades werden in einem eigenen Branch und mit
  Preview-Deployment durchgeführt.
- Die drei hohen Production-Advisories benötigen eine upstream-kompatible
  Paketauflösung oder eine dokumentierte Risikofreigabe; ein Major-Upgrade
  allein darf nicht als Behebung angenommen werden.

## Empfohlene Reihenfolge

1. Bereinigtes `main` koordiniert mit `--force-with-lease` auf GitHub
   veröffentlichen und bestehende Klone danach neu aufsetzen.
2. Admin-Workflow im Produktionsprojekt mit einem Nicht-Admin-Konto prüfen.
3. Monitoring-Anbieter, Datenregion und Secret-Verwaltung freigeben.
4. Next.js 16 in einem eigenen Branch migrieren, die Production-Advisories
   erneut bewerten und den vollständigen Preview-Deploy abnehmen.
