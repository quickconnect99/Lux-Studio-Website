# Software Improvement Roadmap

Stand: 17. August 2026

## Ziel

Diese Roadmap setzt die Ergebnisse der vollständigen Architektur-, Security-,
Performance-, Test- und UX-Analyse in überprüfbare Arbeitspakete um. Ein Paket
gilt erst als erledigt, wenn Implementierung, Regressionstest und relevante
Dokumentation vorhanden sind.

Prioritäten:

- **P0:** akuter Ausfall, Datenverlust oder unmittelbar ausnutzbare Schwachstelle
- **P1:** vor dem nächsten Production Release erforderlich
- **P2:** im nächsten Entwicklungssprint umsetzen
- **P3:** geplante Qualitäts- oder Wartbarkeitsverbesserung

## Phase 1 – Release-Sicherheit und Datenintegrität

### CMS- und Medienintegrität

- [x] Projekt- und Site-Settings-Dateiqueues strikt trennen.
- [x] Medienreferenzen aus `selected_frames`, `motion_frames`, `gallery_items`,
      `video_url` und allen Legacy-Feldern korrekt erfassen.
- [x] TUS-Resume an den tatsächlich fortgesetzten Objektpfad binden.
- [x] Motion Frames in Cleanup-Snapshots aufnehmen.
- [x] Browser-Storage-Fehler abfangen, ohne den Editor unbenutzbar zu machen.
- [x] Demo-Save-Status auf echte Persistenz oder ehrliche Session-Semantik
      abstimmen.
- [x] Regressionstests für alle vorstehenden Fälle ergänzen.

Abnahme:

- Projektaktionen verändern keine vorgemerkten Site-Settings-Dateien.
- Kein noch referenziertes Medium wird durch normalen CMS-Cleanup entfernt.
- Ein unterbrochener Upload speichert nach Resume eine existierende Public URL.

### Runtime und Production-Konfiguration

- [x] Node 24 LTS in Engines, lokaler Versionsdatei, CI und Typen verwenden.
      Status: Die Repository-Konfiguration verwendet Node 24 über `engines`,
      `.nvmrc`, `@types/node` und die von CI gelesene Versionsdatei. Der
      vollständige Quality-Gate-Lauf unter Node 24 bleibt bis zu einem
      erfolgreichen CI-Nachweis offen.
- [x] Produktions-Build bei fehlender oder ungültiger Live-Konfiguration stoppen.
      Status: `npm run build` führt den getesteten Fail-Closed-Validator vor
      Next.js aus; der Nachweis mit den echten Deployment-Secrets bleibt offen.
- [x] Canonical- und Sitemap-Host im Smoke-Test gegen die Ziel-Domain prüfen.
      Status: Der Check ist im Smoke-Script implementiert; ein Lauf gegen die
      tatsächliche Live-Domain bleibt offen.
- [x] Demo-Inhalte und Demo-Admin in Production explizit verhindern.
      Status: Der Production-Validator lehnt aktivierten Admin-Demo-Modus ab. Die
      abschließende Kontrolle der Deployment-Variablen bleibt offen.

Abnahme:

- Frischer Build, Unit-, E2E- und Migrationstest laufen auf Node 24.
- Ein absichtlich unvollständiger Production-Build schlägt mit einer
  verständlichen Konfigurationsmeldung fehl.

### Inquiry, Datenschutz und Betrieb

- [x] Rate-Limit-Schlüssel nicht über wechselnde User-Agents partitionierbar
      machen.
- [x] Proxy-IP-Vertrauensgrenze dokumentieren und testen.
- [x] `Retry-After` für Limits senden; interne Secret-Namen nicht öffentlich
      ausgeben.
- [x] E-Mail-Aufruf begrenzen und gegen doppelte Zustellung absichern.
- [x] E-Mail-Anbieter-Datenfluss und konkrete Aufbewahrung in der Privacy-Seite abbilden.
- [x] Automatisierten Retention-Pfad für alte Inquiries bereitstellen.
      Status: Migration, geschützte Cron-Route und Zeitplan sind im Repository
      vorhanden; angewendete Production-Migration und tatsächliche Cron-Ausführung
      bleiben offen.
- [x] Backup/PITR, Restore-Test, MFA, Signups, Datenregionen und Rechtstext als
      externe Launch-Gates dokumentieren.
      Status: Die Gates sind dokumentiert. Ihre Ausführung und Freigabe wird in
      der separaten Liste „Externe Freigaben“ weiterhin offen geführt.

Abnahme:

- Erfolgs-, DB-Fehler-, Limit-, E-Mail-Timeout- und Retry-Pfade sind getestet.
- Keine externe Infrastrukturmaßnahme wird als erledigt markiert, bevor ein
  realer Nachweis vorliegt.

## Phase 2 – Conversion, Accessibility und Content-Vertrauen

### Öffentliche Customer Journey

- [x] Homepage-End-CTA führt zur Anfrage statt zurück ins Portfolio.
- [x] Featured Cases auf die stärksten drei Projekte begrenzen.
- [x] Services mit Anfrage- und passenden Portfolio-Aktionen verbinden.
- [x] Service-Auswahl aus derselben CMS-Quelle speisen und per URL vorauswählen.
- [x] Work-Filter als benannte semantische Gruppen auszeichnen.
- [x] Projektseiten um einen klaren „Create something similar“-Abschluss
      erweitern.

### Accessibility und mobile Bedienung

- [x] Modal-Menü besitzt einen erreichbaren Schließen-Button im Focus-Trap.
- [x] Aktive Navigation setzt `aria-current="page"`.
- [x] Login, Suche und andere essenzielle Felder besitzen dauerhafte Labels.
- [x] Lightbox und Projektnavigation sind getrennte, verständliche Aktionen.
- [x] Safe-Area-Abstände für Vollbild- und Bottom-UI berücksichtigen.
- [x] Kleine UI-Metadaten bleiben auf Mobilgeräten lesbar.
- [x] Reduced Motion deaktiviert auch Press-/Transform-Effekte.

### Content-Gates

- [ ] Echte Team-Porträts statt Fahrzeug-Fallbacks bereitstellen.
      Status: Demo-Fahrzeugbilder werden auf der öffentlichen About-Seite nicht
      mehr als Team-Porträts oder Team-Galerie ausgegeben. Die Lieferung und
      Freigabe echter Teamfotos bleibt offen.
- [ ] Hospitality-Platzhalter durch freigegebene Medien ersetzen.
- [ ] Bild-Alt-Texte fachlich redigieren und unabhängig von Captions pflegen.
      Status: Alt-Text ist jetzt technisch unabhängig von der Caption — eigenes
      `galleryAltsText`-Feld, eigenes Eingabefeld in Gallery-Editor und Live
      Preview, eigene Spalte in `gallery_items`, eigene Ausgabe im öffentlichen
      Carousel (`normalizeProjectGallery`/`normalizeProjectRecord` führen Alt-Text
      jetzt indexrichtig durch, statt ihn aus der Caption zu synthetisieren). Die
      inhaltliche/fachliche Redaktion der tatsächlichen Alt-Texte für bestehende
      Bilder bleibt offen.
- [ ] Unternehmens-, Provider- und Rechtstexte fachlich abnehmen lassen.

## Phase 3 – Architektur, Datenzugriff und Performance

### Admin-Architektur

- [x] `useAdminData` in Auth-, Projekt-, Media-, Settings- und Workflow-Domänen
      aufteilen.
      Status: Die Save/Delete-Orchestrierung und der Workflow-Bestätigungsdialog
      sind aus `useAdminData` in `hooks/use-admin-workflow.ts` extrahiert;
      `useAdminData` ist jetzt ein reiner Kompositions-Hook über Session-,
      Projekt-, Media-, Settings-, Draft- und Workflow-Hooks.
- [x] Komplexe Zustandsübergänge in testbare Reducer oder State Machines
      extrahieren.
      Status: Der Workflow-Bestätigungsdialog (bisher loser Dialog-State plus
      Pending-Ref) ist als `useReducer`-State-Machine (`idle`/`confirming`) in
      `hooks/use-admin-workflow.ts` modelliert und mit 15 dedizierten Tests
      abgedeckt.
- [x] Project Editor, Preview und Dashboard entlang fachlicher Panels zerlegen.
      Status: Das Dashboard-Feldrouting und der Edit/Preview-Workspace-State sind
      in `hooks/use-admin-workspace-view.ts` ausgelagert; `AdminDashboard` ist
      dadurch bereits schlanker. `project-editor.tsx` (vormals ~920 Zeilen) und
      `live-preview.tsx` (vormals ~800 Zeilen) sind jetzt, nach dem bestehenden
      Site-Settings-Muster (Orchestrator + fachliche Panel-Komponenten), in
      `project-editor-basics-panel.tsx`, `project-editor-media-panel.tsx`,
      `project-editor-publish-panel.tsx` sowie `live-preview-hero-panel.tsx`,
      `live-preview-meta-panel.tsx`, `live-preview-gallery-panel.tsx` zerlegt;
      geteilte Feld-Controls liegen in `project-editor-field-controls.tsx` und
      `live-preview-field-controls.tsx`. Props/Callbacks aus `AdminDashboard`
      sind unverändert, `field-highlight-shell.tsx` bleibt die gemeinsame
      Infrastruktur. Verifiziert: `npm run typecheck`/`lint`/`test` grün sowie
      ein Playwright-gesteuerter manueller Durchlauf im Dev-Server (Projekt
      bearbeiten/speichern/duplizieren, Galerie-Reorder, Feld-Navigation von
      Preview zu Editor) ohne Konsolenfehler.
- [x] Public Rendering und Admin Preview auf gemeinsame View Models ausrichten.
      Status: Ein echter Datenfehler wurde dabei gefunden und behoben — Live
      Preview berechnete die Galerie bisher über ungefiltertes `.split("\n")`,
      während Save- und Public-Pfad `normalizeProjectGallery` nutzten; bei einer
      Leerzeile in der Bilder-Textarea konnte das Captions dauerhaft dem falschen
      Bild zuordnen (jetzt durch einen Regressionstest abgesichert). Live Preview
      zeigt außerdem jetzt per `resolveVideoSource` (derselben Funktion wie die
      öffentliche Seite) an, welche Videoquelle tatsächlich veröffentlicht würde.
- [x] Responsive Preview über echten isolierten Viewport oder Container Queries
      abbilden.

### Supabase und Query-Projektionen

- [x] Generierte `Database`-Typen einführen.
      Status: `lib/database.types.ts` ist in beide Supabase-Clients
      (`lib/supabase.ts`, `lib/supabase-admin.ts`) eingebunden; der komplette
      App-Typecheck bleibt dabei grün. Da diese Umgebung ohne Docker/lokales
      Postgres keinen `supabase gen types typescript --local`-Lauf ausführen
      kann, wurde die Datei sorgfältig aus `supabase/schema.sql` abgeleitet statt
      Tool-generiert. Ein neuer CI-Schritt (`database-migrations`-Job) generiert
      die Typen gegen eine frische migrierte Datenbank und lässt den Build bei
      Abweichung fehlschlagen — das ist der eigentliche Korrektheitsnachweis, der
      erst mit dem nächsten CI-Lauf vorliegt. Die absichtlich weiterhin
      handgeschriebenen `SupabaseProjectRow`/`SupabaseSiteSettingsRow`-Typen
      bleiben als bewusst toleranter Eingabe-Rand für `normalizeProjectRecord`
      bestehen und wurden nicht durch die strikten generierten Typen ersetzt.
- [x] JSONB-Inhalte an der Laufzeitgrenze validieren.
- [x] `select("*")` aus öffentlichen Pfaden entfernen.
- [x] Queries für Shell, Karten, Detail, Sharing und Admin getrennt projizieren.
- [x] Öffentliche Daten langfristig über explizite Views/RPCs freigeben.
      Status: Migration `20260812000200_public_read_views.sql` führt
      `security_invoker`-Views `projects_public`/`site_settings_public` ein;
      `getPublishedProjects`, `getProjectBySlug` und `getSiteSettings` lesen jetzt
      über diese Views statt der Basistabellen. Wie in
      `docs/database-operations.md` gefordert, ist der Entzug der
      Basistabellen-Grants bewusst nicht Teil dieser Änderung, sondern bleibt ein
      separater, eigens zu verifizierender Schritt.
- [x] Historische `NOT VALID`-Constraints prüfen und validieren.
      Status: Migration `20260812000100_validate_data_integrity_constraints.sql`
      führt die drei `VALIDATE CONSTRAINT`-Anweisungen aus
      `docs/database-operations.md` aus; `supabase/schema.sql` wurde entsprechend
      aktualisiert. Gegen eine frische/CI-Datenbank ist das ein No-op; die
      Anwendung auf das produktive Projekt bleibt — wie bei den anderen noch
      ungepushten Migrationen — ein separater, review-pflichtiger Schritt.

### Frontend-Performance

- [x] Globale Client- und Motion-Grenzen reduzieren.
      Status: `framer-motion`s `LazyMotion`/`MotionConfig` liefen bisher im
      Root-Layout und damit auf jeder Route inklusive `/admin`, obwohl
      `m.*`-Komponenten ausschließlich auf der öffentlichen Seite vorkommen. Ein
      neuer `MotionProvider` kapselt das jetzt und wird nur noch im
      `(site)`-Layout (und im eigenständigen `not-found.tsx`) eingebunden;
      `ThemeProvider` am Root bleibt ein reiner Context-Provider. Live im Browser
      verifiziert: `/admin` lädt danach keinen `framer-motion`-Chunk mehr.
- [x] Standardbilder als Server-`next/image` ausliefern; Resilienz nur bei
      tatsächlich externen Quellen hydratisieren.
      Status: Neue `AdaptiveImage`-Komponente (Server Component) prüft anhand der
      URL-Form, ob eine Quelle lokal/gebündelt oder eine echte externe
      Supabase-URL ist (die einzige laut CSP/`next.config.mjs` erlaubte Remote-
      Quelle), und rendert lokale Bilder als reines server-seitiges `next/image`
      ohne die Client-Retry-State-Machine. Eingesetzt in allen bisher als Server
      Component geführten Abschnitten (`business-focus`, `featured-projects`,
      `project-media`, `team-tabs`) sowie an den beiden rein lokalen
      Logo-Stellen. Live geprüft: keine fehlgeschlagenen Bildladevorgänge, keine
      Konsolenfehler auf Home/Work/About/Projekt-Detail.
- [x] Fontgewichte auf die verwendeten Schnitte begrenzen.
- [x] Hero-Video sichtbarkeits-, Data-Saver- und Reduced-Motion-gerecht laden.
- [x] Unnötige Below-the-fold-Preloads entfernen.
- [x] Versionierte Medien langfristig cachen.
      Status: CMS-Uploads verwenden UUID-basierte Objektpfade und einen
      einjährigen Storage-Cache; bewusst unversionierte Repository-Medien bleiben
      mit kurzer Revalidierung auslieferbar.
- [x] Route-spezifische komprimierte JS-, CSS-, Font- und Medienbudgets ergänzen.
      Status: `scripts/check-bundle-budget.mjs` liest jetzt Turbopacks
      `page_client-reference-manifest.js` pro Route und erzwingt getrennte
      Gzip-Budgets für `/admin` (220 KB) und öffentliche Routen (130 KB), gegen
      einen echten Produktions-Build verifiziert (`/admin` aktuell 124 KB,
      öffentliche Routen 74–84 KB).

## Phase 4 – Tests, Observability und Wartung

- [ ] Coverage auf Admin-Hooks und alle API-Routen erweitern.
      Status: Neues jsdom/React-Testing-Library-Fundament (`tests/dom-setup.ts`);
      alle sieben Admin-Domain-Hooks sowie der neue `use-admin-workflow`-Hook
      besitzen jetzt dedizierte Tests (zusammen über 50 neue Unit-Tests) und sind
      im Coverage-Scope. `use-admin-data.ts` selbst bleibt bewusst außerhalb des
      Coverage-Scopes, da es inzwischen ein reiner, dünner Kompositions-Hook ist,
      dessen Verhalten über die Tests der zusammengesetzten Hooks abgedeckt wird.
      Alle API-Routen inklusive der neuen `/api/build-info` sind im Scope.
- [x] Für geschäftskritische Module eigene Coverage-Schwellen setzen.
      Status: `scripts/check-coverage-thresholds.mjs` erzwingt für acht
      daten-/geldnahe Module (u. a. `admin-persistence`, `admin-project-repository`,
      `rate-limit`, `inquiry*`) Schwellen deutlich über dem globalen 75/75/80/70-Gate,
      automatisch nach jedem `npm run test:coverage`-Lauf geprüft.
- [x] Production-Env-, Proxy-IP-, CSP-, Retention-, Outbox-, Telemetry- und
      Revalidate-Pfade mit Unit- beziehungsweise Route-Tests absichern.
- [x] Request-IDs, `no-store`-Antworten und PII-freie strukturierte Events
      für Inquiry, Telemetry, Revalidate, Retention und Notification-Retry
      bereitstellen.
      Status: Instrumentierung und Regressionstests sind repo-seitig vorhanden;
      externes Alerting und der Nachweis in Production-Logs bleiben offen.
- [x] Accessibility-Tests verifizieren vor Axe den erwarteten Seitenzustand.
- [x] Deterministische unmaskierte Visual-Snapshots für Mobile/Desktop und beide
      Themes ergänzen.
      Status: `tests/e2e/visual.spec.ts` deckt jetzt vier Viewports (mobile-390,
      tablet-768, desktop-1440, wide-1920) × zwei Themes (Vintage Light/Dark aus
      `lib/themes.ts`) ab; maskiert wird nur noch `<video>`, alle Bilder sind
      sichtbar. Das Theme wird vor der Navigation per `localStorage` gesetzt; ein
      zweifacher Lade-und-Scroll-Durchlauf wärmt den Next.js-Image-Optimizer-
      Cache vor und macht jedes nativ lazy-geladene Bild mindestens einmal
      sichtbar; die Stability-Wartefunktion berücksichtigt für horizontal
      scrollende Strecken (z. B. „Frames in Motion“) nur Bilder, deren
      BoundingRect den Viewport horizontal überlappt, da alles andere im
      fullPage-Screenshot ohnehin nicht sichtbar wäre. Alle 10 neuen Baseline-PNGs
      wurden gegen einen lokalen Production-Build erzeugt und vor dem Commit
      einzeln angesehen. Die zuvor blockierende parallele Motion-/GSAP-
      Arbeitssitzung (`site-header.tsx`, `motion-provider.tsx`,
      `featured-projects.tsx`) war zum Zeitpunkt dieses Laufs noch unverändert im
      Working Tree vorhanden (seit mehreren Tagen unangetastet, nicht committet);
      die neuen Baselines spiegeln diesen Stand inklusive des neuen
      Motion-Toggles in der Kopfzeile wider. Sobald diese Arbeit fortgesetzt oder
      committet wird, sind die Baselines entsprechend neu aufzunehmen.
- [x] Production-E2E gegen eindeutig identifizierten, frischen Build ausführen.
      Status: Neue Route `/api/build-info` meldet die laufende Commit-SHA;
      `tests/e2e/global-setup.ts` bricht den Produktions-E2E-Lauf ab, wenn der
      laufende Server nicht der für diesen CI-Run gebaute Commit ist. CI setzt
      `BUILD_SHA` auf `github.sha`.
- [x] Lighthouse-/Core-Web-Vitals-Lab-Gate einführen.
      Status: `lighthouserc.json` (Performance/Accessibility/Best-Practices/SEO je
      ≥ 0,8–0,9, LCP/CLS/TBT-Budgets) plus neuer CI-Schritt `npm run lighthouse:ci`
      gegen Home, Work-Übersicht und About. Ein lokaler Verifikationslauf schlug an
      einer bekannten, bereits an anderer Stelle in dieser Roadmap dokumentierten
      Umgebungsgrenze fehl: `lighthouse` benötigt moderne ESM-JSON-Imports, die
      erst ab Node ≥ 22 funktionieren, während diese lokale Umgebung nur Node 20.9
      bereitstellt. Der reale Nachweis läuft erst mit dem nächsten CI-Durchlauf
      unter Node 24.
- [ ] Datenschutzfreigegebenes Error- und Performance-Monitoring anbinden.
      Status: Bleibt an die Anbieter-/Datenregion-Freigabe unter „Externe
      Freigaben“ gekoppelt; ohne freigegebenen Anbieter kein Anschluss.
- [ ] Restore-, Auth- und Incident-Übungen wiederkehrend dokumentieren.
      Status: `docs/incident-drills.md` legt die drei Übungen (Restore-Drill,
      Auth-Konfigurationsprüfung, Incident-Tabletop) inklusive Protokolltabelle
      an. Die erste tatsächliche Durchführung steht noch aus.
- [x] Minor-Updates regelmäßig bündeln; Major-Upgrades einzeln testen.
      Status: `.github/dependabot.yml` bündelt wöchentliche Minor-/Patch-Updates
      (npm und GitHub Actions) automatisch zu je einer PR und lässt Major-Updates
      bewusst einzeln durch. Die fortlaufende Durchführung (PRs tatsächlich prüfen
      und mergen) bleibt ein laufender Prozess, keine einmalige Implementierung.

## Externe Freigaben

Die folgenden Punkte benötigen Zugriff oder Entscheidungen außerhalb dieses
Repositories und bleiben bis zu einem dokumentierten Nachweis offen:

- [ ] Supabase Backup/PITR aktivieren und einen Restore durchführen.
- [ ] Produktions-Auth auf deaktivierte öffentliche Signups, MFA, Passwortregeln,
      Session-Limits und Admin-Allowlist prüfen.
- [ ] Vercel- und Supabase-Datenregion sowie DPA/SCC verifizieren.
- [ ] Monitoring-Anbieter, Datenregion, Aufbewahrung und Zugriffsrechte freigeben.
- [ ] SMTP-Anbieter-Datenverarbeitung und Rechtstexte fachlich beziehungsweise
      juristisch abnehmen.
- [ ] Production-Migrationen anwenden sowie Vercel-Plan und Ausführung beider
      Cron-Jobs nachweisen.
      Status: Sechs Migrationen warten inzwischen auf einen reviewten
      `supabase db push`: Inquiry-Retention, Notification-Outbox,
      Email-Settings, die neue Constraint-Validierung und die neuen
      Public-Read-Views.
- [ ] Aufbewahrung bereits zugestellter Inquiry-E-Mails im Empfängerpostfach
      organisatorisch umsetzen.
- [ ] Echte Team-, Hospitality- und finale Markenmedien liefern und freigeben.

## Release Gate

Vor dem Merge beziehungsweise Deployment müssen mindestens laufen:

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test:coverage` (inklusive Business-Critical-Coverage-Schwellen)
6. `npm run migrations:check`
7. frische lokale Supabase-Datenbank aufbauen, zurücksetzen, linten und die
   generierten `Database`-Typen gegen `lib/database.types.ts` verifizieren
8. `npm run build`
9. `npm run bundle:check` (inklusive routenspezifischer Budgets)
10. `npm run lighthouse:ci`
11. vollständige Production-Playwright-Matrix (inklusive Build-Identitätsprüfung)
12. `npm audit --omit=dev --audit-level=high`
13. Preview-Smoke gegen die tatsächliche Ziel-Domain

Aktueller Integrationsnachweis:

- 229 Unit-/Route-Tests (davon über 50 neu für Admin-Hooks und den
  Workflow-Reducer) und 20 Migrationen laufen grün; der
  Produktions-Dependency-Audit meldet keine Schwachstelle.
- Lint, TypeScript, Unit-Tests mit Coverage- und Business-Critical-Schwellen,
  ein echter Produktions-Build sowie das erweiterte routenspezifische
  Bundle-Budget wurden in dieser Runde lokal grün verifiziert; mehrere
  Kernänderungen (Admin-Workflow, Alt-Text-Fluss, Motion-Provider-Trennung,
  Bildauslieferung) wurden zusätzlich live im Browser nachvollzogen.
- Der Lighthouse-Gate-Schritt ist neu und lokal aus Node-Versionsgründen nicht
  ausführbar (siehe Phase 4); sein erster echter Nachweis steht mit dem
  nächsten CI-Lauf unter Node 24 noch aus.
- Die erweiterten, unmaskierten Visual-Snapshots (vier Viewports × zwei
  Themes, siehe Phase 4) sind umgesetzt und gegen einen lokalen
  Production-Build erzeugt und geprüft; alle zehn Baselines liegen jetzt unter
  `tests/e2e/visual.spec.ts-snapshots/`. Die weiterhin unfertige, uncommittete
  parallele Motion-/GSAP-Arbeitssitzung steckt inhaltlich in diesen Baselines
  (siehe Status-Notiz in Phase 4) und macht eine erneute Aufnahme nötig, sobald
  jene Arbeit committet oder verworfen wird.
- Der vollständige Gate-Lauf unter Node 24, die gesamte Production-Playwright-
  Matrix und der Live-Smoke bleiben vor Merge beziehungsweise Deployment
  verpflichtend. Die lokale Umgebung stellte zuletzt nur Node 20.9 bereit.
