# Review der externen Claude-Analyse

Stand: 29. Juli 2026

Die Hinweise aus `claude analyse.pdf` wurden gegen den aktuellen Quellcode
geprüft. Dieses Dokument hält fest, welche Empfehlungen übernommen, angepasst
oder bewusst zurückgestellt wurden.

## Umgesetzt

### Architektur und Admin

- Die Home-, Services-, About-, Contact- und Work-Vorschauen sind eigenständige
  Module. Die früheren Re-Export-Fassaden und die irreführende Sammeldatei
  `site-settings-pages.tsx` wurden entfernt.
- Feldmarkierung, Dialog-Fokusfalle und Scroll-Lock verwenden gemeinsame
  Komponenten beziehungsweise Hooks.
- Projekt- und Site-Settings-Saves verwenden gemeinsame Optimistic-Locking-,
  Upload-Session- und Save-Report-Helfer.
- Dirty-Checks basieren auf zentralen, normalisierten Form-Snapshots.
- Frames in Motion werden als strukturiertes JSON gespeichert. Bereits
  gespeicherte Einträge im alten `Bild | Link`- oder `Bild -> Link`-Format
  bleiben lesbar.
- Der Keyboard-Save-Handler verwendet React `useEffectEvent`, sodass der
  Event-Listener nicht bei jedem Render neu registriert werden muss und trotzdem
  immer den aktuellen Save-Callback sieht.

### Performance und Medien

- Das Cover auf Projektseiten und das erste Bild der Work-Übersicht werden für
  den LCP priorisiert.
- Das Hero-Video startet bei aktivierter Browser-Datensparoption nicht
  automatisch.
- Repository-Medien erhalten einen begrenzten Browser-Cache mit
  `stale-while-revalidate`.
- Der Bundle-Check validiert Dateisignaturen und erzwingt maximal 1 MiB pro
  eingechecktem Rasterbild.
- Neun vermeintliche JPG-Dateien, die tatsächlich HTML-Fehlerseiten enthielten,
  wurden entfernt. Das einzige verwendete Fallback-Bild wurde durch ein
  gültiges Bild ersetzt.

### Security

- Telemetrie akzeptiert nur Same-Origin beziehungsweise die konfigurierte
  Site-Origin und ist pro Client auf 60 Requests pro Minute begrenzt.
- Die Origin- und Client-Erkennung wird mit der Inquiry-Route geteilt und ist
  separat getestet.
- `.env*` wird grundsätzlich ignoriert; nur `.env.example` darf eingecheckt
  werden.
- Eine Supabase-Migration begrenzt den Storage-Bucket auf freigegebene
  Bild-/Video-MIME-Typen und 500 MiB pro Objekt. Die strengeren
  clientseitigen Limits, etwa 15 MiB für Bilder, bleiben zusätzlich aktiv.

### Tests und CI

- Unit-Tests decken jetzt unter anderem Project Business, Admin Utilities,
  Repository-I/O, Supabase-Normalisierung, Optimistic Mutations,
  Form-Snapshots, Request Security und die strukturierte Frame-Speicherung ab.
- CI prüft Prettier und misst Test-Coverage.
- Der Next-Build-Cache wird zwischen CI-Läufen wiederverwendet.
- CI testet zusätzlich einen mobilen WebKit-Viewport.
- Der authentifizierte CMS-Mutationstest ist separat gekennzeichnet und läuft
  nur mit vollständigen Zugangsdaten eines isolierten Testprojekts.
- Feste Playwright-Wartezeit wurde durch browserseitiges Warten auf zwei
  Animationsframes ersetzt.

## Angepasst statt wörtlich übernommen

- Für `/images` und `/media` wird kein einjähriges `immutable` gesetzt. Die
  Dateinamen sind nicht gehasht und redaktionelle Assets können unter derselben
  URL ersetzt werden. Ein Cache von einer Stunde plus
  `stale-while-revalidate` verbessert die Auslieferung, ohne Updates ein Jahr
  lang festzuhalten.
- Der Bucket erhält ein serverseitiges Gesamtlimit von 500 MiB, weil Supabase
  pro Bucket nur ein gemeinsames Objektlimit anbietet. Dateityp-spezifische
  Größen bleiben deshalb zusätzlich im Admin-Upload validiert.
- Statt die bestehenden Frame-Spalten sofort per Datenbankmigration zu ändern,
  wird strukturiertes JSON innerhalb des bestehenden `text[]` gespeichert.
  Dadurch bleiben aktuelle Inhalte und Rollback-Kompatibilität erhalten.

## Bewusst nicht automatisiert

- Eine einzelne CSP-Hash-Regel ersetzt `unsafe-inline` in einer Next-App nicht
  zuverlässig: RSC-/Hydration-Skripte benötigen eine request-spezifische
  Nonce-Strategie. Das ist ein eigener, deploymentübergreifender Umbau und darf
  nicht als isolierter Header-Patch erfolgen.
- Linux-spezifische visuelle Referenzbilder wurden nicht auf einem
  Windows-Arbeitsplatz neu erzeugt. Die vorhandene tolerante, maskierte
  Baseline bleibt portabler; eine neue Linux-Baseline sollte aus einem
  kontrollierten CI-Lauf geprüft und übernommen werden.
- Die vollständige Zerlegung von `project-editor.tsx`, `live-preview.tsx` und
  `admin-dashboard.tsx` wurde nicht in einem riskanten Big-Bang durchgeführt.
  Gemeinsame Logik und UI-Primitiven sind bereits extrahiert; weitere Schnitte
  sollten funktionsweise erfolgen.
- Eine zusätzliche Type-Coverage-Abhängigkeit wurde nicht eingeführt. Das
  Projekt verwendet bereits striktes TypeScript, ESLint ohne Warnungen und
  einen verpflichtenden CI-Typecheck.

## Externe Release-Schritte

- Die Storage-Migration muss vor dem Live-Rollout im verknüpften
  Supabase-Projekt geprüft und angewendet werden.
- Der echte CMS-Mutationstest benötigt Zugangsdaten zu einem isolierten
  Testprojekt und darf niemals gegen Produktionsdaten laufen.
- CSP-Nonces benötigen einen eigenen Preview-Rollout mit Prüfung von
  App-Router, Hydration und Drittressourcen.

## Zweiter Analyseteil

### Accessibility

- Öffentliche Seiten werden automatisiert in Vintage Dark und Vintage Light
  geprüft. Mobile Navigation, Formularfehler, Lightbox und Admin-Workspace sind
  zusätzliche Axe-Zustände.
- Ein Skip-Link steht vor der Navigation und springt zu `#main-content`.
- Lightbox- und Carousel-Zähler melden Bildwechsel über eine höfliche
  Live-Region.
- Direkte Akzenttexte verwenden im Light Theme den kontraststärkeren
  `--accent-text`-Token. Der Muted-Text besitzt zusätzlichen AA-Puffer.

### Migrationen

- Eine idempotente Baseline-Migration ermöglicht echte Fresh Installs.
- CI startet lokales Supabase/Postgres, wendet alle Migrationen an, setzt die
  Datenbank erneut zurück und führt den Datenbank-Linter aus.
- Galerieform, Projektjahr und Inquiry-Service-Typ werden durch zunächst
  `NOT VALID` gesetzte Constraints für neue und geänderte Zeilen geschützt.
- Backup-, PITR-, Roll-forward- und Constraint-Validierungsabläufe sind in
  `docs/database-operations.md` festgehalten.
- Der frühere `id = 'default'`-Fehler bleibt als unveränderte historische
  Migration erhalten; die bestehende Folgemigration für `id = 'global'`
  korrigiert ihn. Bereits veröffentlichte Migrationen werden nicht umgeschrieben.
- `business` und `category` erhalten bewusst keine Enum-Checks: Beide Felder
  sind im Admin als erweiterbare Datalist-Felder modelliert, nicht als
  abgeschlossene Enums.

### Dependencies und SEO

- Die unterstützte Node-Laufzeit ist als `>=20.19.0 <21` deklariert und die
  direkte PostCSS-Anforderung beginnt bei der sicheren Version 8.5.24.
- Major-Upgrades für Tailwind, TypeScript und ESLint stehen als getrennte Gates
  in der technischen Roadmap.
- 404-Seiten besitzen öffentliche Navigation, Footer und Noindex-Metadaten.
- VideoObject-Daten verwenden absolute Vorschaubilder sowie `embedUrl` für
  YouTube/Vimeo und `contentUrl` für direkte Videos.
- Work erhält `CollectionPage`/`ItemList`; Work, About, Services und Contact
  erhalten Seiten- und Breadcrumb-Daten.
- Open Graph enthält `en_US`; Sitemap und Robots besitzen präzisere
  Crawl-Hinweise.
- Leere Telefonnummern und Social-Profil-Platzhalter werden nicht mehr als
  Organization-Felder ausgegeben.
- Ein generisches gebrandetes OG-Bild ersetzt nicht die bereits gewünschte
  projektbezogene Foto-Vorschau. Die bestehende Bildstrategie bleibt daher
  bewusst erhalten.

### Verbleibender Tooling-Schritt

- Die direkten `@typescript-eslint`-Pakete sind nach dem Flat-Config-Umbau
  vermutlich redundant. Ihre Entfernung sowie die Angleichung von
  `@types/node` an Node 20 benötigen einen erneuten Paketmanager-Lauf; dieser
  wurde durch die lokale Freigabe-/Nutzungsgrenze gestoppt und nicht umgangen.
