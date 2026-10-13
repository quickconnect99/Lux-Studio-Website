# Lux Studio – vollständige GUI-Analyse

Stand: 8. Oktober 2026. Schwerpunkt: Handy; ergänzend Tablet, Desktop, beide Themes und Admin.

**Umsetzungsstand:** Die technischen und gestalterischen Änderungen zu allen 27 Auditpunkten sind im Website-Code umgesetzt. Der gewählte transparente Menü-Mittelweg bleibt erhalten. Der [geführte Rundgang mit 24 Vorher-Nachher-Schritten](../test-results/gui-all-implementation/rundgang.html) zeigt die tatsächliche Umsetzung; [Design-QA und Prüfbelege](../design-qa.md) dokumentieren die Abnahme. Freigegebene echte Team-Portraits und das endgültige Studio-Showreel bleiben redaktionelle Inhalte, die nicht durch diese GUI-Arbeit produziert werden.

## Umsetzung aller Auditpunkte

| ID  | Umgesetzte Änderung                                                                                                                 | Abnahme                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| G01 | Anfrage-CTA am Startseitenende führt zu Contact.                                                                                    | Beide Home-Anfrageaktionen führen zu `/contact`.                                                                        |
| G02 | Services verwenden tatsächlich vorhandene Projektkategorien; unbekannte Kategorien zeigen einen leeren Zustand mit Reset.           | Vier Related-Work-Ziele mit passenden Ergebnissen; Reset zeigt wieder sieben lokale Projekte.                           |
| G03 | Selected Frames zeigt mobil ein großes Hauptbild mit dezenten, antippbaren Nachbarbild-Vorschauen.                                  | Vorher/Nachher bei 390 px betrachtet; Nachiteration mit Vorschauen am 9. Oktober abgenommen.                            |
| G04 | Wichtige mobile Labels sind größer und haben weniger Laufweite; Formulartext und Admin-Status sind lesbarer.                        | Öffentliche Ansichten und Admin-Details betrachtet.                                                                     |
| G05 | Kompakter Kontaktkopf, E-Mail-Alternative und Formular zuerst; ausführliches Kontaktpanel darunter.                                 | Erstes Feld bei y ≈ 539 statt 929 px.                                                                                   |
| G06 | Video-Consent liegt im normalen Fluss; der Text bestimmt die notwendige Rahmenhöhe.                                                 | Isolierter Vergleich der tatsächlichen Komponenten bei 320 px: Text vollständig sichtbar, kein iframe vor Einwilligung. |
| G07 | Redundante bewegte Bildleiste mobil ausgeblendet, Featured-Projekte kompakter und über Bilder erreichbar.                           | Startseite ungefähr 5.409 statt 6.679 px hoch.                                                                          |
| G08 | Hero ab 1024 px zweispaltig; Medium folgt dem Seitenverhältnis.                                                                     | Filmstart bei 1024 px: y ≈ 200 statt 621 px.                                                                            |
| G09 | Projektfilm direkt nach Titel und kurzen Fakten; ausführliche Informationen darunter.                                               | Filmstart mobil: y ≈ 256 statt 692 px.                                                                                  |
| G10 | Kompaktere Seitenköpfe und Projektkarten mit einer Informationszeile.                                                               | Work und Projektdetail in beiden Themes und Größenmatrix geprüft.                                                       |
| G11 | Sichtbare Scrollspur und begrenzte Filterreihen; aktive Auswahl bleibt sichtbar.                                                    | Filterwahl, Reset und Größenmatrix bestanden.                                                                           |
| G12 | Gemeinsame Touch-Gesten für Galerie, Projektbilder und Lightbox; horizontale Gesten von vertikalem Scrollen getrennt.               | Touch-Simulation, normale Bildklicks und Tastatur separat bestanden.                                                    |
| G13 | Aktive Menüziffern, Admin-Tabs und aktive Badges verwenden passende Farben für invertierte Flächen.                                 | Beide Themes visuell und mit Axe geprüft.                                                                               |
| G14 | Hero-Icon-Aktionen mindestens 44 × 44 px.                                                                                           | Browsermessung bestanden.                                                                                               |
| G15 | Kompakte Serviceblöcke mit Icon/Titel, einfacher Deliverable-Liste und einer Hauptaktion.                                           | Services ungefähr 2.868 statt 4.126 px hoch.                                                                            |
| G16 | Vorhandene Teamnamen, Rollen und Beschreibungen erscheinen auch ohne Portrait.                                                      | Beide Profile sichtbar; Fahrzeugbilder werden nicht als Portraits verwendet.                                            |
| G17 | Größere Status-Badges; mobile Projektliste ohne separate begrenzte Scrollfläche.                                                    | Admin-Liste und Badge-Detail betrachtet.                                                                                |
| G18 | Zusätzliche Speicheraktion im Projekteditor-Kopf mit denselben Regeln wie unten.                                                    | Beide Aktionen vorhanden; keine Admin-Inhalte gespeichert.                                                              |
| G19 | Kleinerer Footer-Claim, zweispaltige mobile Navigation und kürzerer Abschlussabstand.                                               | Footer ungefähr 720 statt 1.070 px hoch.                                                                                |
| G20 | Standard-Anfrageaktionen heißen einheitlich Start A Project; individuelle CMS-Texte bleiben möglich.                                | Home, Services und Footer geprüft; Legacy-Standardtexte werden vereinheitlicht.                                         |
| G21 | Work-Fieldsets und Filterbreite begrenzt.                                                                                           | Dokumentüberlauf bei 390 px: 440 → 0 px.                                                                                |
| G22 | Admin-Haupt- und Untertabs intern scrollbar und auf verfügbare Breite begrenzt.                                                     | Dokumentüberlauf bei 390 px: 108 → 0 px.                                                                                |
| G23 | Adaptive Seitentitel und geringere mobile Einrückung.                                                                               | Hospitality passt bei 320/390 px ohne abgespaltenen Endbuchstaben.                                                      |
| G24 | Lightbox-Pfeile in einer gemeinsamen unteren Zeile; dunkle Bildfläche ohne grauen Filmrahmen.                                       | Beide Pfeile haben dieselbe y-Position; Escape und Fokusrückgabe bestanden.                                             |
| G25 | Gewählte Glasnavigation mit 65 % Theme-Tönung und 40 px Blur; kräftige Beschriftung.                                                | Helles und dunkles Menü betrachtet, Fokus und Escape geprüft.                                                           |
| G26 | Redaktionelle Legal-Prüfhinweise im Admin; öffentliche Legal-Seiten bereinigt. Echtes vorhandenes Portfolio-Still als Video-Poster. | Öffentliche Seiten, Admin-Checks und reduzierte Bewegung geprüft.                                                       |
| G27 | Sichtbares Fehlerpanel, Feldfokus und eigenständige Erfolgsbestätigung mit erneutem Anfrageweg.                                     | Validierung, simulierte 503-/200-Antworten, Werterhalt und Fokus bestanden.                                             |

Bei der Prüfung wurde zusätzlich die lokale Projektgalerie korrigiert: vorhandene Galerie-Dateien werden auch angezeigt, wenn die Demo-Daten noch keine strukturierten `galleryItems` enthalten.

## Messergebnisse und Prüfung der Umsetzung

| Messung                        |     Vorher |    Nachher |
| ------------------------------ | ---------: | ---------: |
| Work-Dokumentüberlauf, 390 px  |     440 px |       0 px |
| Admin-Dokumentüberlauf, 390 px |     108 px |       0 px |
| Kontakt: erstes Feld, 390 px   | y ≈ 929 px | y ≈ 539 px |
| Projekt: Filmstart, 390 px     | y ≈ 692 px | y ≈ 256 px |
| Home-Gesamthöhe, 390 px        |   6.679 px |   5.409 px |
| Services-Gesamthöhe, 390 px    |   4.126 px |   2.868 px |
| Footer-Höhe, 390 px            | ≈ 1.070 px |   ≈ 720 px |

Die Nachprüfung umfasst 154 Seiten-/Viewport-/Theme-Fälle und 14 zusätzliche Projektfälle nach der Galerie-Korrektur: kein horizontaler Dokumentüberlauf und keine defekten Bilder. Hinzu kommen gezielte Touch-, Link-, Formular-, Menü-, Admin- und Accessibility-Prüfungen, 233 bestandene Unit-Tests sowie bestandene Typ- und Lint-Prüfungen. Der Rundgang enthält 52 eingebettete Bilder; Schrittwahl, Weiter/Zurück und Bilddecodierung sind geprüft. Details und Grenzen stehen in der [Design-QA](../design-qa.md).

## Ursprünglicher Audit vor der Umsetzung

**Historische Bestandsaufnahme:** Der folgende Bericht und seine Screenshots beschreiben den Zustand vor den oben dokumentierten Änderungen. Aussagen wie „noch kein implementierter Fix“ und die damaligen offenen Befunde gehören zu dieser Bestandsaufnahme. Für den aktuellen Stand gelten die Umsetzungstabelle und die Design-QA. G06 wurde inzwischen zusätzlich im ausdrücklich gekennzeichneten Komponentenvergleich geprüft.

## Gesamtbewertung

Der schlechte Eindruck auf dem Handy hat nachvollziehbare Ursachen: **zwei echte Layoutüberläufe, zu spät sichtbare Hauptinhalte, aufwendige Galerieflächen und sehr kleine Bedienungsbeschriftungen**. Die Gestaltung besitzt eine klare Identität. Dunkelgrün, Orange, Serifentitel und Fahrzeugbilder funktionieren besonders im breiten Desktop-Hero. Auf schmalen Bildschirmen fehlt an mehreren Stellen eine eigene Priorisierung von Inhalt und Bedienung.

Zuerst sollten die Überläufe, fehlerhaften Linkziele und Galerie-Steuerelemente korrigiert werden. Danach lohnt sich eine kompaktere mobile Gestaltung von Kontakt, Projektdetail, Services und Startseite. Pauschal alle Schriftgrößen zu verkleinern würde die Lesbarkeit weiter verschlechtern.

Die Audit-Aufnahmen mit Anmerkungen stehen in der [Screenshot-Galerie](../test-results/gui-audit-2026-10-08/index.html). Die Galerie folgt dem Besucherablauf und enthält anschließend Admin, Größenvergleiche und ausdrücklich gekennzeichnete CSS-Proben. Alle Bilder sind zusätzlich direkt in der HTML-Datei eingebettet. Die später umgesetzte Menügestaltung ist im oben verlinkten Rundgang dokumentiert.

## Prüfumfang und Belege

- Eigener, neu gestarteter Headless-Chromium mit getrennten Browser-Kontexten; keine vorhandenen Browserfenster, Tabs oder Nutzerprofile verwendet.
- Lokale App mit aktuellen Standard-/Demo-Inhalten. Geprüft: Home, Work, Midnight-Aeroline-Projektdetail, Services, About, Contact, Impressum, Datenschutz, 404 sowie Admin-Projektliste, Editor, Vorschau und Site Settings.
- Größen: 320 × 568, 390 × 844, 430 × 932, 768 × 1024, 1024 × 768 und 1440 × 1000. Zusätzlich Menü im Querformat 844 × 390, helles Theme und reduzierte Bewegung.
- Aktuelle Screenshots wurden gespeichert und visuell betrachtet. DOM-Messungen, zugängliche Namen, Tastaturbedienung, Touch-Simulation und Axe-Prüfungen ergänzen die Bildanalyse.
- Formularfehler und Erfolg wurden mit lokal abgefangenen API-Antworten geprüft. Es wurden keine echten Anfragen verschickt und keine Admin-Inhalte gespeichert.
- Rohdaten und reproduzierbare Aufnahmeskripte: [Audit-Artefakte](../test-results/gui-audit-2026-10-08/). Der Next.js-Entwicklungsindikator ist in den Screenshots ausgeblendet; ansonsten zeigen die Basisaufnahmen den unveränderten Seitenzustand. Screenshots frieren Animationen für die Aufnahme ein; normale und reduzierte Bewegung wurden zusätzlich geprüft.

**Evidenzstatus:** „Laufzeit“ bezeichnet Beobachtungen in der gerenderten lokalen App. „Gestaltung“ bezeichnet begründete Verbesserungsvorschläge. „Quellcode-Risiko“ wurde noch nicht mit einem passenden Laufzeitfall bestätigt. CMS- und Produktionsinhalte können abweichen.

## Priorisierte Befunde

P1 = zuerst korrigieren, weil Hauptablauf oder mobile Bedienung betroffen sind. P2 = anschließend Gestaltung und Konsistenz verbessern. P3 = Feinschliff. Die Kennungen aus der ersten Quellcodeanalyse bleiben erhalten; neue Laufzeitbefunde beginnen bei G21.

| ID  | Prio | Beobachtung und Beleg                                                                                                                                                                                | Konkrete Verbesserung                                                                                                                             |
| --- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| G21 | P1   | **Work überläuft um 440 px bei 390 px Bildschirmbreite.** Der Filter „Rolling Shots“ lässt sich in diesem Zustand nicht normal anklicken. Laufzeit, Bilder 03 und 20.                                | `min-width: 0` für Filter-Fieldsets; die Filterreihe innerhalb der verfügbaren Breite scrollen lassen.                                            |
| G22 | P1   | **Admin überläuft um 108 px bei 390 px.** Der letzte Workspace-Tab liegt außerhalb des Bildschirms. Laufzeit, Bilder 11, 24–26.                                                                      | Tab-Leiste begrenzen und intern scrollbar machen; danach kompakte mobile Hauptnavigation prüfen.                                                  |
| G25 | P1   | **Helles Handy-Menü hat eine transparente Hintergrundfläche.** Unten liegt grauer Text über dunklen Seitenfarben. Laufzeit, Bild 27; berechnete Hintergrundfarbe `rgba(0,0,0,0)`.                    | Transparenz nach Nutzerpräferenz behalten: getönte Glasfläche mit Blur und kräftiger Textfarbe unten; aktiven Zustand separat prüfen.             |
| G01 | P1   | **„Start A Project“ am Ende der Startseite führt zu `/work`.** Klick bestätigt.                                                                                                                      | Anfrage-CTA zu `/contact` führen und alle Anfragebezeichnungen vereinheitlichen.                                                                  |
| G02 | P1   | **Services → „Related Work“ → „Commercial Shoot“ zeigt alle sieben Projekte.** Kein entsprechender Projektfilter aktiv. Laufzeit.                                                                    | Explizite Zuordnung von Services zu Projekten/Kategorien; ungültige Filter nicht stillschweigend verwerfen.                                       |
| G05 | P1   | **Erstes Kontaktfeld beginnt erst bei y ≈ 929 px** auf 390 × 844. Titel und direktes Kontaktpanel füllen den Einstieg. Laufzeit, Bilder 07 und 14.                                                   | Kurzer Titel, kompakter E-Mail-Link, anschließend sofort das Formular; Zusatzinformationen darunter.                                              |
| G24 | P1   | **Lightbox-Pfeile liegen auf zwei verschiedenen Zeilen.** Vorheriger Pfeil bei y = 736 px, nächster bei y = 792 px. Laufzeit, Bild 19.                                                               | Beide Pfeile, Zähler und Hinweis in einer gemeinsamen Bedienzeile; Bildfläche an Bildformat und verfügbare Höhe anpassen.                         |
| G12 | P1   | **Wischen wechselt in der normalen Galerie kein Bild. Auch in der Lightbox blieb die Touch-Simulation auf Bild 01/04.** Pfeilbedienung funktioniert. Laufzeit plus Quellcode.                        | Swipe konsistent implementieren; Pointer-Abbruch und `touch-action` prüfen, danach auf echten Touch-Geräten abnehmen.                             |
| G03 | P2   | Selected Frames: mittleres Bild ca. **304 × 228 px innerhalb einer mindestens 380 px hohen Bühne** bei 390 px. Dekorative Vorschaubilder und Zähler beanspruchen viel Raum. Bild 12.                 | Mobile Galerie mit einem dominanten Bild, kompakter Bedienzeile und optionalen Thumbnails.                                                        |
| G04 | P2   | Viele Metadaten/Labels **10–12 px**, starke Laufweite und Versalien; im Admin einzelne Indizes unter 8 px. Laufzeit und CSS.                                                                         | Wichtige UI-Labels 13–14 px, weniger Laufweite; normale Schreibweise für Informationen.                                                           |
| G23 | P2   | Gefilterter Titel bricht als **„HOSPITALIT / Y“** um. Laufzeit, Bild 20.                                                                                                                             | Titelgröße, Einrückung und Umbruchregeln an lange Wörter anpassen; nicht beliebig mitten im Wort umbrechen.                                       |
| G09 | P2   | Projektfilm beginnt erst bei **y ≈ 692 px**, nach Metadaten und vollständiger Beschreibung. Bild 04.                                                                                                 | Titel und eine kurze Meta-Zeile, dann Film/Key Visual, danach Beschreibung und Produktionsdetails.                                                |
| G15 | P2   | Services benötigen ungefähr **631 px je Leistung**, mit vier einzeln gerahmten Deliverables und zwei Buttons. Bild 13.                                                                               | Kompakte Leistungsblöcke, Deliverables als Liste, Details optional aufklappbar, eine dominante Aktion.                                            |
| G07 | P2   | Startseite ca. **6.679 px** hoch: zwei Galeriemuster, drei Featured-Projekte, Business-Karten und weiterer CTA.                                                                                      | Bild- und Projektzugänge kuratieren; redundante Abschnitte zusammenführen und Anfrage früher erreichbar machen.                                   |
| G08 | P2   | Hero stapelt auch bei 1024 px noch; Reel beginnt dort bei **y ≈ 621 px**. Erst bei 1280 px zwei Spalten.                                                                                             | Tablet und kleinen Desktop eigenständig komponieren; Medienhöhe am Seitenverhältnis ausrichten.                                                   |
| G10 | P2   | Work-Karten wiederholen Kategorie und enthalten mehrere Metadatenreihen. Auf Desktop beginnt die erste Karte erst bei **y ≈ 927 px**.                                                                | Einstieg verkürzen; Karten auf Bild, Titel, eine Infozeile und klare Navigation reduzieren.                                                       |
| G11 | P2   | Scrollbare Filter haben ausgeblendete Scrollbar und Maskierung. Auch nach Behebung von G21 sind weitere Optionen wenig offensichtlich.                                                               | Angeschnittene nächste Option/Scrollhinweis zeigen; aktive Auswahl sichtbar halten, bei vielen Optionen Filterdialog.                             |
| G13 | P2   | Aktive Menüziffern: rechnerisch **2,22:1 dunkel / 1,79:1 hell**. Zusätzlich Axe-Kontrastbefund beim überlaufenden Admin-Tab „Email“ im dunklen Theme.                                                | Passenden Text-Token für invertierte Flächen nutzen; Admin-Tab nach Layoutkorrektur erneut prüfen.                                                |
| G14 | P2   | Hero-Pause und Ton tatsächlich **40 × 44 px**; Header-Menü/Theme dagegen 44 × 44 px.                                                                                                                 | Icon-Aktionen konsequent auf mindestens 44 × 44 px als Komfortziel bringen.                                                                       |
| G16 | P2   | About zeigt in den lokalen Daten **keine sichtbaren Teamprofile**, überwiegend Text und Werte. Bild 06.                                                                                              | Freigegebene Personenbilder, Namen und Rollen ergänzen; Namen/Rollen auch ohne Portrait sinnvoll anzeigen.                                        |
| G17 | P2   | Admin nutzt kleine Statusbeschriftungen und verschachtelte Scrollflächen. Bilder 11, 24–26.                                                                                                          | Eine gut lesbare Statuszeile und möglichst ein primärer Scrollbereich; seltene Metadaten nachrangig.                                              |
| G18 | P2   | Mobiler Projekteditor ca. **4.987 px** lang; statische Speicheraktion nach langem Formular.                                                                                                          | Zusätzliche Speicheraktion im kompakten Kopf; Zustand „gespeichert/ungespeichert“ sichtbar halten.                                                |
| G27 | P2   | Fehler/Erfolg stehen als kleiner Absatz nach Datenschutztext, während das Formular bestehen bleibt. Bilder 22 und 23; API simuliert.                                                                 | Deutliches Statuspanel mit Überschrift; nach Erfolg klarer Bestätigungszustand und sinnvoller Fokus.                                              |
| G26 | P2   | Legal zeigt Besucherinnen und Besuchern Bearbeitungshinweise wie „Before launch…“ und einen Placeholder-Prüfstatus. Reduzierte Bewegung zeigt außerdem einen Showreel-Platzhalter. Bilder 08 und RM. | Redaktionelle Hinweise nur im Admin anzeigen; öffentliche Inhalte und finales Reel vor Veröffentlichung freigeben.                                |
| G06 | P2   | **Quellcode-Risiko:** externer Video-Einwilligungsblock ist absolut in einem `overflow-hidden`-Rahmen positioniert; kann bei schmaler Breite zu hoch werden.                                         | Consent-Text mobil im normalen Dokumentfluss; separat mit langem YouTube-/Vimeo-Text prüfen. Aktuelle lokale Videos bestätigen diesen Fall nicht. |
| G19 | P3   | Footer beansprucht bei 390 px ungefähr **1.070 px**; große Headline, fünf gestapelte Links und viel Schlussabstand.                                                                                  | Kompakterer Claim, zweispaltige Navigation, Kontakt priorisieren, Abstand am Gerätebedarf ausrichten.                                             |
| G20 | P3   | „Start An Inquiry“, „Start A Project“ und „Start A Brief“ benennen denselben Weg.                                                                                                                    | Einheitlicher Anfrage-CTA und kontextbezogene Beschreibung daneben.                                                                               |

## Mobile Layoutfehler und ihre Ursachen

### Work: Filter verbreitern das gesamte Dokument

![Projektübersicht bei 390 px](../test-results/gui-audit-2026-10-08/03-work-mobile-390.png)

Bild 03: Der rechte Teil der Kategorien liegt außerhalb des Screenshots. Der Filter-Fieldset hat ca. 797 px Breite, seine innere Reihe ca. 829 px, obwohl der sichtbare Viewport 390 px breit ist. Das standardmäßige `min-width: min-content` des Fieldsets verhindert das gewünschte Schrumpfen. Ein normaler Klick auf „Category: Rolling Shots“ lief außerhalb des erreichbaren Bereichs in einen Timeout.

Eine **nur im Browser** eingefügte Regel `fieldset { min-width: 0 }` reduzierte den Dokumentüberlauf von 440 auf 0 px. Das Fieldset war danach 358 px breit, die innere Reihe blieb innerhalb der Seite scrollbar. [Bild 30: CSS-Probe](../test-results/gui-audit-2026-10-08/30-work-css-probe-mobile-390.png). Das ist eine nachgewiesene Ursache und noch kein implementierter Fix.

Quellen: [Work-Seite](../app/%28site%29/work/page.tsx), [Project Grid](../components/sections/project-grid.tsx).

### Admin: Workspace-Navigation ist zu breit

Die obere Tab-Leiste wächst mit ihren Beschriftungen über den Container hinaus. Bei 390 px werden 108 px zusätzliche Dokumentbreite erzeugt; „Email“ liegt außerhalb des sichtbaren Bereichs. Projekte, Vorschau und Site Settings zeigen denselben überlaufenden Kopf.

Eine **nur im Browser** begrenzte Tab-Leiste mit `overflow-x: auto` und nicht schrumpfenden Buttons reduzierte den Überlauf auf 0 px. [Bild 31: CSS-Probe](../test-results/gui-audit-2026-10-08/31-admin-css-probe-mobile-390.png). Als dauerhafte mobile Gestaltung wäre eine kompaktere Navigation sinnvoller als immer mehr gleichrangige Tabs.

Quelle: [Admin Dashboard](../components/admin/admin-dashboard.tsx).

| Viewportbreite | Work: zusätzliche Dokumentbreite | Admin: zusätzliche Dokumentbreite |
| -------------- | -------------------------------: | --------------------------------: |
| 320 px         |                           509 px |                            179 px |
| 390 px         |                           440 px |                            108 px |
| 430 px         |                           400 px |                             69 px |
| 768 px         |                             0 px |                              0 px |
| 1024 px        |                             0 px |                              0 px |
| 1440 px        |                             0 px |                              0 px |

Die übrigen untersuchten Hauptrouten zeigten in der Größenmatrix keinen horizontalen Dokumentüberlauf. Eine absichtlich innerhalb eines Containers scrollbare Galerie ist davon zu unterscheiden.

### Helles Menü: Blur ersetzt keine Hintergrundfläche

Bild 27 zeigt den hellen Menüanfang auf Creme und den unteren Bereich über dunklen Seitenfarben. Die berechnete Hintergrundfarbe des Dialogs ist transparent, das Hintergrundbild `none`, während `backdrop-filter: blur(40px)` aktiv ist. Die Klasse `bg-background/95` erzeugt hier also nicht die gewünschte deckende Fläche.

Die Browser-Probe `background: var(--background)` stellt eine durchgehend lesbare Fläche her. [Bild 32: deckende Menü-Probe](../test-results/gui-audit-2026-10-08/32-menu-opaque-probe-light-390.png). Diese Probe ist ausdrücklich keine neue Website-Version.

**Nachtrag zur Gestaltung:** Die Nutzerpräferenz ist ein transparenter Glas-Look. Deshalb wurden zwei weitere Browser-Proben mit 65 % und 80 % Tönung erstellt; beide behalten den vorhandenen 40-px-Blur. Nur der kleine Text unten erhält zusätzlich die kräftige Theme-Textfarbe. [Variantenvergleich in beiden Themes](../test-results/gui-audit-2026-10-08/menue-mittelweg.html). Anschließend wurde die gewählte **65-%-Variante umgesetzt** und auf Home/Contact in beiden Themes sowie in acht zusätzlichen Größen-/Theme-Fällen geprüft. Der [neue Rundgang](../test-results/menu-glass-implementation/rundgang.html) zeigt die tatsächliche Umsetzung. Weitere Seitenmotive und echte Geräte bleiben Teil einer späteren Abnahme.

Quellen: [Header](../components/layout/site-header.tsx), [Farbkonfiguration](../tailwind.config.ts).

## Visuelle Hierarchie nach Seite

**Home:** Die Marke bleibt auf Handy erkennbar, aber zwei breite Aktionen und viel Text liegen vor dem Reel. Bei 390 px beginnt es bei y ≈ 514 px. Danach konkurrieren zwei Galeriemuster mit drei großen Projektblöcken. Vorschlag: kurze Positionierung, frühes Reel, zwei bis drei kompakte Projekte, Leistungsüberblick und eine klare Anfrage. Die seitlichen Vorschaubilder der Selected-Frames-Galerie sollten auf Handy zugunsten eines größeren Hauptbilds entfallen. Featured-Bilder und Titel könnten zusätzlich zum Button ins Projekt führen.

**Work:** Nach G21 den PageHeader und die Karten verkürzen. Auf Desktop liegt die erste Karte bei y ≈ 927 px und damit fast außerhalb des ersten 1000-px-Bildschirms. Auf Handy führen wiederholte Kategorie- und Fahrzeuginformationen zu langen Karten. Business und Kategorie sollten als klarer Filterzustand erkennbar sein. Der Hospitality-Titel benötigt kontrollierte Umbrüche.

**Projektdetail:** Der Film beginnt bei y ≈ 692 px. Für ein Filmstudio sollte das Werk früher sichtbar sein. Titel, Kategorie/Ort/Jahr in einer kurzen Zeile, dann Film, anschließend Geschichte und Produktionsdetails. Die Lightbox braucht eine gemeinsame Pfeilzeile. Ihre Bildbühne ist sehr hoch für ein Querformatfoto; `.film-frame` überschreibt außerdem den schwarzen Rahmenhintergrund mit einer hellen transparenten Fläche. Der Lightbox-Hintergrund selbst wurde mit 95 % Schwarz gemessen. Weniger dekorativer Rahmen und mehr nutzbare Bildfläche würden die Präsentation verbessern.

**Services:** Vier große Leistungsblöcke zu je rund 631 px erzeugen eine lange Auswahlstrecke. Titel und Icon in eine Zeile, Beschreibung kürzen, Deliverables als einfache Liste oder zugänglichen Aufklappbereich darstellen. Anfrage als Hauptaktion, zugehörige Arbeiten als leichteren Textlink. Die bestehende Service-Vorauswahl im Kontaktformular funktioniert; die Verbindung zu passenden Projekten muss korrigiert werden.

**About:** Die Seite wirkt in der lokalen Version anonym, weil Teamprofile fehlen. Echte Namen, Rollen, ein Gruppenbild oder freigegebene Portraits würden den Kontakt persönlicher machen. Fehlende Portraits sollten nicht automatisch die gesamten Personendaten ausblenden. Werte knapp halten und mit Arbeitsweise oder einem Projektbeispiel konkretisieren.

**Contact:** Das erste Feld bei y ≈ 929 px ist die deutlichste Priorisierungsfrage. Direkt nach einem kurzen Titel sollte der Anfrageweg beginnen. E-Mail als kompakte Alternative, Ortsangaben und ausführliche Informationen danach. Company ausdrücklich optional und Pflichtfelder verständlich markieren. Erfolg als eigenständiges Panel statt kaum auffälligem Text nach dem Datenschutzhinweis darstellen.

**Legal, Datenschutz, 404:** Textbreiten und Absätze bleiben mobil innerhalb der Seite. Der große gemeinsame Einstieg und Footer verlängern auch diese Informationsseiten stark. Für Legal/Privacy einen kompakteren Titel verwenden; redaktionelle Prüftexte aus der öffentlichen Darstellung entfernen. Die 404 bietet sinnvolle Rückwege, braucht aber keinen Footer von mehr als einer Bildschirmhöhe. Rechtstexte wurden hier ausschließlich hinsichtlich Darstellung bewertet.

**Admin:** Die mobile Trennung zwischen Projekte, Edit und Preview ist sinnvoll. Nach G22 Kopf und Activity-Panel verkürzen, damit die eigentliche Arbeit früher sichtbar wird. Größere Statuslabels, zusammengehörige Felder in kurze Gruppen, einklappbare seltene Einstellungen und eine erreichbare Speicheraktion verbessern den langen Editor. Die Vorschau sollte durch Aufrufen der echten Route ergänzt werden.

| Route, bei 390 × 844       | Gesamthöhe, ungefähr | Relevante Position                              |
| -------------------------- | -------------------: | ----------------------------------------------- |
| Home                       |             6.679 px | Reel ab 514 px                                  |
| Work, alle sieben Projekte |             5.154 px | Dokumentüberlauf 440 px                         |
| Midnight Aeroline          |             3.407 px | Film ab 692 px                                  |
| Services                   |             4.126 px | Leistungsblöcke je ca. 631 px                   |
| About                      |             2.338 px | Keine sichtbaren Teamprofile in lokalen Daten   |
| Contact                    |             2.861 px | Name-Feld ab 929 px                             |
| Impressum                  |             2.991 px | Redaktionelle Hinweise sichtbar                 |
| Datenschutz                |             4.443 px | Lange Informationsseite plus gemeinsamer Footer |
| 404                        |             1.817 px | Rückwege vorhanden                              |
| Admin, Projekteditor       |             4.987 px | Überlauf 108 px                                 |

Gesamthöhe allein ist kein Fehler. Diese Werte zeigen, wo Inhalt, Rahmen und Wiederholungen die mobile Nutzung verlängern. Die Empfehlung folgt dem Zweck der jeweiligen Seite.

## Typografie, Themes und Touch

Die Kombination aus schmaler Schrift, 10–12 px Größe, Versalien und 0,20–0,30 em Laufweite ist bei Metadaten und Bedienung unnötig anstrengend. Der Fließtext ist bereits überwiegend ausreichend groß. Empfohlene Ausgangswerte: 16–18 px Fließtext, 13–14 px UI-Labels, 12–13 px nachrangige Metadaten; anschließend visuell prüfen. Lange Überschriften sollten ihre Größe und Einrückung begrenzen, statt einzelne Endbuchstaben auf neue Zeilen zu zwingen.

Die regulären Muted-Textfarben auf der jeweiligen Basisfläche ergeben rechnerisch ca. 7,85:1 dunkel und 5,34:1 hell. Die problematischen aktiven Menüziffern sind ein lokaler invertierter Zustand: `#ec824d` auf `#f2e9db` ca. 2,22:1 und `#ad4815` auf `#1e493d` ca. 1,79:1. Für bedeutungstragenden normalen Text nennt WCAG 4,5:1. Die Zahlen sind Token-Berechnungen, keine umfassende Messung aller gerenderten Hintergründe. [W3C: Textkontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

44 × 44 px ist hier das empfohlene Komfortziel für Touch-Aktionen. WCAG 2.2 AA verwendet grundsätzlich 24 × 24 CSS-Pixel mit definierten Ausnahmen und Abstandsregeln; 44 px ist somit kein pauschaler AA-Mindestwert. Die Hero-Icons wurden mit 40 × 44 px gemessen, Menü und Theme-Schalter mit 44 × 44 px. [W3C: Zielgröße](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Work und Admin verdienen zuerst eine Reflow-Korrektur. Die W3C-Erläuterung behandelt die Darstellung bei 320 CSS-Pixel Breite ohne unnötiges zweidimensionales Scrollen; absichtlich räumliche Inhalte haben Ausnahmen. [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## Was im Browser bereits funktioniert

- Öffentliche Hauptrouten und 404 lieferten in den getesteten 390-px-Standardzuständen keine Axe-Verstöße mit WCAG-2.0/2.1/2.2-AA-Regeltags. Die zusätzlichen hellen Hauptrouten waren ebenfalls ohne gemeldete Verstöße.
- Ein Axe-Befund im dunklen Admin betrifft den überlaufenden Email-Tab: gemeldeter Kontrast 2,24:1. Wegen seiner Position außerhalb des sichtbaren Bereichs zusammen mit G22 beheben und erneut messen.
- Menü setzt den Fokus auf Home, Shift+Tab bleibt im Dialog, Escape schließt und die Scroll-Sperre wird aufgehoben. 320-px- und Querformatmenü waren intern scrollbar. Auch die geprüften Menü-, Lightbox- und Validierungszustände waren ohne Axe-Verstöße.
- Hospitality-Filter setzt die URL korrekt und zeigt zwei Projekte. Service-Vorauswahl „Commercial Shoot“ im Kontaktformular funktioniert.
- Leeres Kontaktformular mit vorausgewähltem Service markiert drei Pflichtfelder und fokussiert Name. Beim simulierten API-Fehler bleiben Angaben erhalten; nach simuliertem Erfolg wird das Formular zurückgesetzt.
- Galerie-Pfeil wechselt das Bild. Reduzierte Bewegung pausiert das Hero-Video im untersuchten Zustand; die laufende Bildleiste bietet einen Pause-Schalter.
- Keine erfassten JavaScript-`pageerror`-Ereignisse in den protokollierten Browserläufen. Keine defekten Bilder in den untersuchten vollständig durchgescrollten 390-px-Seiten.

Diese Ergebnisse sind gezielte Prüfungen, keine vollständige WCAG-Zertifizierung. Axe erfasst weder die gesamte visuelle Hierarchie noch alle Transparenz-, Touch- und Scrollprobleme.

## Grenzen und noch nötige Abnahme

Die Analyse deckt die aktuelle lokale Oberfläche und die zentralen Besucherabläufe ab. Noch offen sind echte iOS-/Android-Geräte, Safari, Bildschirmtastatur und dynamische Browserleisten, 200 % Textvergrößerung/400 % Browserzoom, reale Bildschirmleser, Performance auf langsamen Geräten sowie reale Versand-/Speicherprozesse. Loading- und Serverfehlerkomponenten wurden im Quellcode bewertet, aber nicht gezielt als eigene Laufzeitzustände ausgelöst.

Der externe YouTube-/Vimeo-Einwilligungsfall G06 bleibt ausdrücklich unbestätigt, weil die untersuchten Projektdaten lokale MP4-Dateien verwenden. Hintergrundlinks bleiben in den aufgenommenen ARIA-Snapshots bei offenen Dialogen enthalten; Fokussteuerung funktioniert, die Isolation für echte Bildschirmleser sollte separat geprüft werden. Das fehlgeschlagene Lightbox-Wischen ist ein Befund aus Chromium-Touch-Simulation und braucht eine Geräteprüfung. `touch-action` wurde am Rahmen mit `auto` gemessen; daraus allein folgt noch keine abschließend nachgewiesene Fehlerursache.

## Empfohlene Umsetzung und Abnahmekriterien

1. **Technische mobile Fehler:** G21/G22 begrenzen, G25 als lesbare getönte Glasfläche gestalten, G01/G02 Linkziele korrigieren, G24 Pfeilzeile ordnen und G12 Touch-Verhalten prüfen.
2. **Hauptaufgaben priorisieren:** Kontaktformular und Projektfilm nach oben; mobile Galerie vereinfachen; Labels und lange Titel lesbar gestalten.
3. **Inhalte straffen:** Services und Projektkarten verdichten, Startseiten-Galerien kuratieren, echte Teamdaten und finales Reel freigeben, Footer verkürzen.
4. **Admin verbessern:** kurze Arbeitsbereiche, klare Statuszeile, erreichbares Speichern und Prüfung auf echten Geräten.

Abnahme für die erste Runde: kein Dokumentüberlauf bei 320/390/430 px; alle Filter/Tabs erreichbar; Related Work zeigt nachvollziehbar passende Projekte; Anfrage-CTA führt zur Anfrage; beide Lightbox-Pfeile auf einer Zeile; Swipe wechselt Bilder auf einem echten Handy; helles Menü bleibt auf allen Seiten lesbar; Formularfehler erhalten Eingaben und Erfolg zeigt eine eindeutige Bestätigung. Anschließend dieselben Größen und beide Themes erneut visuell vergleichen.

Für den mobilen Einstieg würde ich als Gestaltungsziel das erste Formularfeld innerhalb des ersten Bildschirms und das Projektmedium direkt nach Titel/kurzen Fakten ansetzen. Das sind überprüfbare Produktziele, keine aus WCAG abgeleiteten Pixelgrenzen.
