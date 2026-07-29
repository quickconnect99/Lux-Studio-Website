# Technische Roadmap

Stand: 29. Juli 2026

## Zielbild

Lux Studio ist eine responsive, barrierearme Portfolio-Website mit einem
ausfallsicheren Admin-Bereich. Redaktionelle Änderungen dürfen bei Deployments,
Browser-Reloads oder paralleler Bearbeitung nicht still verloren gehen.

## 1. Öffentliche Website – erledigt

- Work zeigt alle Projekte ohne „Load more“.
- Shot With Intent und Frames in Motion sind getrennt, frei sortierbar und
  nicht auf acht Bilder begrenzt.
- Ausgewählte Frames speichern Bild und Projektlink gemeinsam.
- Projektbilder besitzen Carousel und zugänglichen Fullscreen-Modus.
- Navigation, Theme-Switch, Logo, Footer, Legal Notice und responsive
  Skalierung sind über 320, 390, 768, 1440 und 1920 Pixel getestet.
- Öffentliche Metadaten und Organisation-JSON-LD werden ausschließlich im
  `(site)`-Layout geladen; Admin-Routen hängen nicht von öffentlichen
  Supabase-Abfragen ab.

## 2. Admin-Resilienz – erledigt

- `/admin` ist dynamisch und verwendet kein ISR. Dadurch können keine alten
  Admin-HTML-Seiten auf bereits entfernte Deployment-Chunks zeigen.
- Chunk-Fehler werden erkannt, höchstens einmal automatisch neu geladen und
  bieten danach eine manuelle Wiederholung.
- Project Editor, Live Preview und Site Settings besitzen eigene
  Error-Boundaries. Ein Fehler in einem Panel entfernt nicht den gesamten
  Workspace-Zustand.
- Projekt- und Site-Settings-Texte werden versioniert in `localStorage`
  gesichert und nach einem kompatiblen Reload wiederhergestellt.
- Lokale Dateien werden aus Sicherheitsgründen nicht persistiert; nach einer
  Wiederherstellung weist der Admin auf eine erneute Auswahl hin.
- `updated_at` dient beim Speichern als optimistischer Konkurrenzschutz.
  Parallele Änderungen aus einem anderen Tab werden nicht überschrieben.
- Bereinigung verwaister Medien und öffentliche Revalidierung werden abgewartet
  und erscheinen bei Fehlern als Warnung im Save Report.

## 3. Redaktionsoberfläche – erledigt

- Gallery Editor ist kontrolliert und synchronisiert Projektwechsel, Saves,
  Vorschau-Änderungen und Team-Galerien ohne Remount-Abhängigkeit.
- Social Links, Werte und Services verwenden typisierte Arrays und echte
  Repeater statt redaktioneller `|`-Textformate.
- Services, Deliverables, Werte und Social Links können hinzugefügt, entfernt
  und – wo relevant – sortiert werden.
- Die veröffentlichte Projektbild-Bibliothek ist standardmäßig geschlossen und
  besitzt Suche, Projektfilter und schrittweises Nachladen.
- Bekannte lokale und Supabase-Bilder werden optimiert; unbekannte externe
  Hosts bleiben aus Sicherheits- und Kompatibilitätsgründen unoptimiert.

## 4. Uploads und Medien – erledigt

- MIME-Typ, Endung und Größe werden vor Upload geprüft.
- Standard-Uploads sind für kleine Dateien vorgesehen. Dateien über 6 MB
  verwenden den offiziellen Supabase-TUS-Endpunkt mit 6-MB-Chunks,
  Wiederholungsstrategie und Resume-Fingerprint.
- Neue Uploads werden bei einem fehlgeschlagenen Datenbank-Save zurückgerollt.
- Ersetzte Medien werden erst gelöscht, wenn kein Projekt und keine Site
  Settings sie mehr referenzieren.
- `project-reel.mp4` wurde mit H.264 CRF 28, AAC 96 kbit/s und Faststart von
  12.9 MB auf 7.4 MB reduziert. Gemessene Video-SSIM: `0.989`.
- CI erzwingt 8 MB pro Repository-Video, 1.65 MB für alle erzeugten
  JavaScript-Chunks und 320 kB pro Einzelchunk.

## 5. Security, Datenschutz und Betrieb – erledigt

- Kontaktanfragen akzeptieren maximal 32 kB und stoppen auch gestreamte
  Payloads oberhalb des Limits.
- Origin-Prüfung, persistentes Rate Limit, Honeypot, Zeitprüfung und
  serverseitige Validierung bleiben aktiv.
- Next.js läuft auf `16.2.12`, React auf `19.2.8`.
- Der Production-Audit ist ohne bekannte Schwachstellen; sichere
  PostCSS-/Sharp-Versionen werden gezielt überschrieben.
- First-Party-Web-Vitals-Telemetrie ist implementiert, aber standardmäßig
  deaktiviert. Aktivierung erfolgt nur mit
  `NEXT_PUBLIC_ENABLE_TELEMETRY=true`; es werden keine URLs oder Formulardaten
  erfasst und die Datenschutzerklärung blendet den Hinweis dann automatisch ein.
- Externe Analytics-, Monitoring- oder Error-Tracking-Anbieter bleiben bis zu
  einer Entscheidung über Anbieter, Datenregion, Vertrag und Aufbewahrung aus.

## 6. Tests und CI – erledigt

- CI beendet ältere Läufe bei neuen Commits und besitzt ein 30-Minuten-Limit.
- Typecheck, ESLint Flat Config, Unit-Tests und Migrationsprüfung laufen vor dem
  Build.
- Playwright startet in CI den fertigen Next-Produktionsserver.
- Die Browser-Suite enthält responsive Tests, Axe WCAG A/AA, eine visuelle
  Desktop-Baseline und einen Site-Settings-Draft-Reload-Test.
- Ein echter authentifizierter Site-Settings-Save-und-Restore-Test ist
  vorhanden und läuft ausschließlich bei gesetzten dedizierten
  Test-Zugangsdaten plus `E2E_ALLOW_CMS_MUTATIONS=true`.
- Diagnoseartefakte werden bei CI-Fehlern hochgeladen.

Zusätzlich prüft die Axe-Suite Dark und Light Theme sowie offenes Mobile-Menü,
Validierungsfehler, Lightbox und den Admin-Workspace. Eine eigenständige
CI-Stage baut eine frische lokale Supabase-Datenbank aus allen Migrationen auf,
setzt sie erneut zurück und führt den SQL-Linter aus. Paket-Skripte und
Datenbankbetrieb sind in `docs/project-scripts.md` und
`docs/database-operations.md` dokumentiert.

## 7. Geplante Major-Upgrades

Diese Upgrades werden separat umgesetzt, weil sie Konfiguration, generierten
Code oder Framework-Kompatibilität verändern:

- Tailwind CSS 3 auf 4: CSS-first-Konfiguration und Plugin-Kompatibilität in
  einem eigenen UI-Regression-Branch prüfen.
- TypeScript 5 auf 7: nativen Compiler, Next.js-Typgenerierung und ESLint-Regeln
  zunächst in CI ohne Emit vergleichen.
- ESLint 9 auf 10: erst durchführen, wenn `eslint-config-next` und sämtliche
  Plugins die neue Major-Version offiziell unterstützen.

## Externe Gates

Diese Punkte sind vorbereitet, dürfen aber nicht ohne zusätzliche Autorisierung
oder Infrastruktur automatisch ausgeführt werden:

1. Authentifizierten Mutationstest nur gegen ein isoliertes Supabase-Testprojekt
   aktivieren; niemals gegen die Live-Datenbank.
2. Monitoring-/Analytics-Anbieter, Datenregion, Aufbewahrung und
   Datenschutzhinweis freigeben.
3. Rechtstexte und Unternehmensangaben fachlich bzw. juristisch abnehmen.
4. Neue Migrationen und Deployment-Umgebungsvariablen vor Live-Rollout im
   verknüpften Projekt kontrollieren.

## Release-Check

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:coverage`
5. `npm run migrations:check`
6. Frische Supabase-Datenbank aufbauen, zurücksetzen und linten
7. `npm run build`
8. `npm run bundle:check`
9. `PLAYWRIGHT_USE_PRODUCTION=true npm run test:e2e`
10. `npm audit --omit=dev --audit-level=high`
11. Preview-Smoke-Test, danach erst Produktionsdeployment
