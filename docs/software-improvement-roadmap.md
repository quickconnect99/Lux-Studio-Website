# Software Improvement Roadmap

Stand: 1. August 2026

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
- [x] Resend-Datenfluss und konkrete Aufbewahrung in der Privacy-Seite abbilden.
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
- [ ] Unternehmens-, Provider- und Rechtstexte fachlich abnehmen lassen.

## Phase 3 – Architektur, Datenzugriff und Performance

### Admin-Architektur

- [ ] `useAdminData` in Auth-, Projekt-, Media-, Settings- und Workflow-Domänen
  aufteilen.
- [ ] Komplexe Zustandsübergänge in testbare Reducer oder State Machines
  extrahieren.
- [ ] Project Editor, Preview und Dashboard entlang fachlicher Panels zerlegen.
- [ ] Public Rendering und Admin Preview auf gemeinsame View Models ausrichten.
- [x] Responsive Preview über echten isolierten Viewport oder Container Queries
  abbilden.

### Supabase und Query-Projektionen

- [ ] Generierte `Database`-Typen einführen.
- [x] JSONB-Inhalte an der Laufzeitgrenze validieren.
- [x] `select("*")` aus öffentlichen Pfaden entfernen.
- [x] Queries für Shell, Karten, Detail, Sharing und Admin getrennt projizieren.
- [ ] Öffentliche Daten langfristig über explizite Views/RPCs freigeben.
- [ ] Historische `NOT VALID`-Constraints prüfen und validieren.

### Frontend-Performance

- [ ] Globale Client- und Motion-Grenzen reduzieren.
- [ ] Standardbilder als Server-`next/image` ausliefern; Resilienz nur bei
  tatsächlich externen Quellen hydratisieren.
- [x] Fontgewichte auf die verwendeten Schnitte begrenzen.
- [x] Hero-Video sichtbarkeits-, Data-Saver- und Reduced-Motion-gerecht laden.
- [x] Unnötige Below-the-fold-Preloads entfernen.
- [x] Versionierte Medien langfristig cachen.
  Status: CMS-Uploads verwenden UUID-basierte Objektpfade und einen
  einjährigen Storage-Cache; bewusst unversionierte Repository-Medien bleiben
  mit kurzer Revalidierung auslieferbar.
- [ ] Route-spezifische komprimierte JS-, CSS-, Font- und Medienbudgets ergänzen.

## Phase 4 – Tests, Observability und Wartung

- [ ] Coverage auf Admin-Hooks und alle API-Routen erweitern.
  Status: Alle derzeitigen API-Routen sind im Coverage-Scope und besitzen
  Route-Tests; die Abdeckung der Admin-Hooks bleibt offen.
- [ ] Für geschäftskritische Module eigene Coverage-Schwellen setzen.
- [x] Production-Env-, Proxy-IP-, CSP-, Retention-, Outbox-, Telemetry- und
  Revalidate-Pfade mit Unit- beziehungsweise Route-Tests absichern.
- [x] Request-IDs, `no-store`-Antworten und PII-freie strukturierte Events
  für Inquiry, Telemetry, Revalidate, Retention und Notification-Retry
  bereitstellen.
  Status: Instrumentierung und Regressionstests sind repo-seitig vorhanden;
  externes Alerting und der Nachweis in Production-Logs bleiben offen.
- [x] Accessibility-Tests verifizieren vor Axe den erwarteten Seitenzustand.
- [ ] Deterministische unmaskierte Visual-Snapshots für Mobile/Desktop und beide
  Themes ergänzen.
- [ ] Production-E2E gegen eindeutig identifizierten, frischen Build ausführen.
- [ ] Lighthouse-/Core-Web-Vitals-Lab-Gate einführen.
- [ ] Datenschutzfreigegebenes Error- und Performance-Monitoring anbinden.
- [ ] Restore-, Auth- und Incident-Übungen wiederkehrend dokumentieren.
- [ ] Minor-Updates regelmäßig bündeln; Major-Upgrades einzeln testen.

## Externe Freigaben

Die folgenden Punkte benötigen Zugriff oder Entscheidungen außerhalb dieses
Repositories und bleiben bis zu einem dokumentierten Nachweis offen:

- [ ] Supabase Backup/PITR aktivieren und einen Restore durchführen.
- [ ] Produktions-Auth auf deaktivierte öffentliche Signups, MFA, Passwortregeln,
  Session-Limits und Admin-Allowlist prüfen.
- [ ] Vercel- und Supabase-Datenregion sowie DPA/SCC verifizieren.
- [ ] Monitoring-Anbieter, Datenregion, Aufbewahrung und Zugriffsrechte freigeben.
- [ ] Resend-Datenverarbeitung und Rechtstexte fachlich beziehungsweise juristisch
  abnehmen.
- [ ] Production-Migrationen anwenden sowie Vercel-Plan und Ausführung beider
  Cron-Jobs nachweisen.
- [ ] Aufbewahrung bereits zugestellter Inquiry-E-Mails im Empfängerpostfach
  organisatorisch umsetzen.
- [ ] Echte Team-, Hospitality- und finale Markenmedien liefern und freigeben.

## Release Gate

Vor dem Merge beziehungsweise Deployment müssen mindestens laufen:

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test:coverage`
6. `npm run migrations:check`
7. frische lokale Supabase-Datenbank aufbauen, zurücksetzen und linten
8. `npm run build`
9. `npm run bundle:check`
10. vollständige Production-Playwright-Matrix
11. `npm audit --omit=dev --audit-level=high`
12. Preview-Smoke gegen die tatsächliche Ziel-Domain

Aktueller Integrationsnachweis:

- 138 Unit-/Route-Tests und 17 Migrationen wurden in den Agent-Workstreams
  erfolgreich geprüft; der Dependency-Audit meldete keine Schwachstelle.
- Gezielte Lint-, TypeScript-, Bundle-, Responsive-, Axe- und Visual-Checks
  waren grün. Der nachträglich ergänzte Hero-Sichtbarkeitstest ist noch Teil
  des ausstehenden Gesamtlaufs.
- Der vollständige Gate-Lauf unter Node 24, die gesamte Production-Playwright-
  Matrix und der Live-Smoke bleiben vor Merge beziehungsweise Deployment
  verpflichtend. Die lokale Umgebung stellte zuletzt nur Node 20.9 bereit.
