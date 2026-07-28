# Technische Roadmap

Stand: 28. Juli 2026

## Zielbild

Lux Studio soll als responsive, barrierearme und zuverlässig deploybare
Portfolio-Website funktionieren. Redakteure müssen Medien eindeutig Projekten
zuordnen und Änderungen ohne Datenverlust speichern können. Fehler externer
Dienste dürfen nicht als leeres Portfolio erscheinen.

## Status

- `Erledigt`: im Repository umgesetzt
- `Verifikation`: umgesetzt, vollständige Regression läuft noch
- `Geplant`: sinnvoller weiterer Schritt ohne akuten Funktionsblocker
- `Gate`: benötigt Produktionszugang, echte Inhalte oder eine externe Entscheidung

## Phase 0 – Datenschutz und Repository

Status: `Erledigt`, koordinierter Remote-Historienabgleich bleibt ein `Gate`

- Private Dokumente und echte Umgebungsdateien sind nicht Teil des Git-Index.
- Schutzmuster für Rechnungen und lokale Secrets bleiben in `.gitignore`.
- Ein historischer Remote-Rewrite darf nur koordiniert mit allen
  Repository-Nutzern erfolgen.

## Phase 1 – Öffentliche Funktionen und Navigation

Status: `Erledigt`

Erledigt:

- Shot With Intent besitzt kein stilles Acht-Bilder-Limit mehr.
- Shot With Intent und Frames in Motion können getrennt und in beliebiger
  Reihenfolge gepflegt werden.
- Beide Frame-Bereiche besitzen eine veröffentlichte Projektbild-Bibliothek.
- Frame-Auswahlen speichern Bild und internen Projektlink gemeinsam.
- Identische Bild-URLs verschiedener Projekte behalten dadurch ihre eindeutige
  Zuordnung.
- Interne Frame-Links verwenden Next-Navigation im selben Tab.
- Die Work-Filter synchronisieren sich mit URL-Änderungen und melden ihren
  aktiven Zustand mit `aria-pressed`.
- Die Ergebnisanzahl der Work-Filter wird für assistive Technik angekündigt.
- Die Next-Project-Navigation wird bei null oder nur einem Projekt nicht
  gerendert.
- Einwort-Projekttitel erzeugen keine leere zweite Titelzeile.

Akzeptanzkriterien:

- Leere und nicht leere Frames-in-Motion-Auswahlen bleiben nach Speichern und
  erneutem Laden exakt erhalten.
- Mehr als acht Shot-With-Intent-Bilder erscheinen öffentlich.
- Vor/Zurück-Navigation des Browsers hält Work-URL und Filterzustand synchron.

## Phase 2 – Projektmedien und Fullscreen

Status: `Erledigt`

Erledigt:

- Projektbilder erscheinen nur noch in einer zentralen Carousel-/Gallery-UI.
- Captions bleiben im Carousel sichtbar und werden auch für Bildbeschreibungen
  verwendet.
- Der Fullscreen-Modus zeigt Bilder mit `object-contain` ohne Beschnitt.
- Lightbox: Escape, Pfeiltasten, Fokus-Trap, initialer Fokus,
  Fokuswiederherstellung, Scroll-Lock und Touch-Swipe.
- Das Datenmodell erhält strukturierte `gallery_items`; die bisherigen
  Bild-/Caption-Arrays bleiben während der kompatiblen Migration erhalten.
- JSON-LD verwendet eine sichere Serialisierung.

Geplant:

- Nach erfolgreichem Produktions-Rollout die Legacy-Spalten
  `gallery_images`/`gallery_captions` in einer separaten Migration entfernen.
- Redaktionell pflegbare individuelle Alt-Texte im Gallery Editor ergänzen.

## Phase 3 – Accessibility und responsive Bedienung

Status: `Erledigt`

Erledigt:

- Theme-Switcher besitzt während der Hydration einen größenstabilen Platzhalter.
- Inquiry-Status wird über `status`/`alert` und `aria-live` angekündigt.
- Bei Formularfehlern springt der Fokus zum ersten fehlerhaften Feld.
- Shake-Timer werden beim Unmount sauber beendet.
- Admin-Bestätigungsdialoge besitzen Fokus-Trap, initialen Fokus,
  Fokuswiederherstellung und Scroll-Lock.
- Frames in Motion verwendet Pointer Events und Pointer Capture statt
  getrennter Mouse-/Touch-Logik.
- Öffentliche Error-, Global-Error- und Loading-Boundaries sind vorhanden.
- Frame-Alt-Texte verwenden Projekttitel, sofern eine Projektzuordnung bekannt
  ist.

Geplant:

- Axe-Core in die Browser-Suite aufnehmen.
- Screenreader-Tests für Menü, Lightbox, Filter und Inquiry als feste
  Release-Checkliste dokumentieren.

## Phase 4 – Uploads und Storage-Lifecycle

Status: `Erledigt`

Erledigt:

- Bilder und Videos werden nach MIME-Typ, Dateiendung, positiver Dateigröße und
  Maximalgröße geprüft.
- Erlaubte Bilder: AVIF, GIF, JPEG, PNG und WebP bis 15 MB.
- Erlaubte Videos: MOV, MP4 und WebM bis 500 MB.
- Storage-Dateien verwenden UUIDs und `upsert: false`; bestehende Dateien
  werden nicht überschrieben.
- Mehrere Uploads laufen mit begrenzter Parallelität.
- Schlägt der Datenbank-Save fehl, werden neu hochgeladene Dateien
  zurückgerollt.
- Ersetzte oder gelöschte Medien werden nur entfernt, wenn sie weder von
  Projekten noch von Site Settings referenziert werden.

Geplant:

- Resumierbare Uploads und serverseitiges Transcoding für große Videos.
- Automatische Bildvarianten und Komprimierung vor dem Produktions-Rollout.
- Periodischer read-only Orphan-Report für den Storage.

## Phase 5 – Datenresilienz, SEO und Security

Status: `Erledigt`; echte Inhalte und rechtliche Abnahme bleiben ein `Gate`

Erledigt:

- Supabase-Abfragefehler werfen einen kontrollierten Seitenfehler statt leere
  Arrays oder Demo-Inhalt zurückzugeben.
- Fallback-Inhalte enthalten keine erfundene Telefonnummer und keine generischen
  YouTube-/Vimeo-Profile mehr. Ein neutraler Instagram-Plattformlink hält die
  ausdrücklich gewünschte Footer-Aktion sichtbar.
- Organisation-JSON-LD verwendet das echte Lux-Studio-Logo.
- JSON-LD escaped scriptkritische Zeichen.
- Die Sitemap ist ISR-basiert und verwendet echte Änderungszeitpunkte.
- Projekte und Site Settings aktualisieren `updated_at` über Datenbank-Trigger.
- Ein kombinierter Published-/Created-Index ist für wachsende Projektlisten
  vorbereitet.
- Eine dokumentweite Content-Security-Policy ergänzt die vorhandenen
  Sicherheitsheader.
- CMS-Inhalte werden nicht mehr rekursiv anhand vorhandener Projektkategorien
  umgeschrieben.
- Die Migrationen `20260728000200` bis `20260728000400` sind auf dem
  verknüpften Supabase-Projekt angewendet und remote verifiziert.

Gate:

- Echte Telefonnummer und echte Social-Profile im CMS hinterlegen, falls sie
  öffentlich gezeigt werden sollen.
- Rechtstexte und Unternehmensangaben fachlich/juristisch abnehmen.

## Phase 6 – Performance und Refactoring

Status: teilweise `Erledigt`, Rest `Geplant`

Erledigt:

- Der globale Framer-Motion-Wrapper und die clientseitige Root-Routenanimation
  wurden entfernt.
- Nur Vintage Light und Vintage Dark bleiben als Theme-Typen und CSS-Tokens
  erhalten.
- Dynamische lokale und Supabase-Bilder werden optimiert; unbekannte externe
  Hosts bleiben aus Kompatibilitätsgründen unoptimiert.
- Frame-Bibliothek und Zuordnungslogik sind aus der großen Settings-Datei
  extrahiert.

Geplant:

- `project-editor.tsx`, `live-preview.tsx` und die verbleibenden
  Settings-Seiten weiter nach Inhaltsdomänen aufteilen.
- Textbasierte `|`-Formate für Services, Werte und Social-Links durch typisierte
  Repeater ersetzen.
- Das 12-MB-Demo-Projektvideo extern transcodieren oder durch eine kleinere
  Produktionsfassung ersetzen; im Repository ist kein Video-Encoder vorhanden.
- Bundle-Grenzwerte automatisiert im CI-Build protokollieren.

## Phase 7 – Tests, CI und Deployment

Status: `Erledigt`

Erledigt:

- Unit-Tests decken interne Frame-Links, doppelte Bild-URLs, sichere JSON-LD-
  Serialisierung, leere Motion-Frames und Uploadvalidierung ab.
- CI prüft Benennung und Eindeutigkeit aller versionierten Migrationen.
- Typecheck, Lint, Unit-Tests, Build und responsive Playwright-Tests bleiben die
  Freigabekette.

Geplant:

- Die große responsive E2E-Datei in Navigation, Media, Admin und Layout teilen.
- Stabile visuelle Regressionen für Home, Work, Projektdetail und mobile
  Navigation aufnehmen.
- Einen echten Supabase-Save/Reload-Test in einer isolierten Testdatenbank
  ausführen.
- Supabase-Typen nach jeder Remote-Migration automatisiert generieren.

Gate:

- CI kann Remote-Migrationsparität erst mit einem dedizierten
  Supabase-CI-Zugang prüfen.
- Produktions-Smoke-Test mit echtem Admin- und Nicht-Admin-Konto.

Aktueller Prüfstand:

- TypeScript-Typecheck: erfolgreich.
- ESLint: erfolgreich.
- Unit-Tests: 32 erfolgreich.
- Migrationsprüfung: 12 eindeutig benannte und sortierte Migrationen.
- Remote-Migrationsstand: alle 12 lokalen und entfernten Versionen stimmen
  überein.
- Responsive Playwright-Suite: 73 erfolgreich, 67 absichtlich
  viewportabhängig übersprungen, keine Fehler.
- Next.js-Produktions-Build: erfolgreich.

## Phase 8 – Betrieb und externe Entscheidungen

Status: `Gate`

- Monitoring-Anbieter, Datenregion, Aufbewahrung und Secrets festlegen.
- Alerts für Inquiry-Speicherfehler und fehlgeschlagene E-Mail-Benachrichtigungen
  konfigurieren.
- Next-Major-Upgrade in eigenem Branch mit Preview-Deployment durchführen.
- Keine automatischen Force-Upgrades oder ungeprüften Dependency-Downgrades.

## Release-Reihenfolge

1. [x] Lokale Qualitätskette vollständig grün abschließen.
2. [x] Neue Migrationen im verknüpften Supabase-Projekt anwenden.
3. [ ] Admin-Save/Reload für beide Frame-Sammlungen und Projektgalerien prüfen.
4. [ ] Mobile, Tablet, Desktop und Wide-Desktop visuell abnehmen.
5. [ ] Echte Kontakt-, Social- und Legal-Daten prüfen.
6. [ ] Preview deployen, Live-Smoke-Test ausführen und erst danach
   veröffentlichen.
