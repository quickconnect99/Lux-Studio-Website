# Design QA – vollständige GUI-Umsetzung

**final result: passed**

**Nachiteration vom 9. Oktober 2026:** G03 wurde auf Nutzerwunsch um dezente mobile Nachbarbild-Vorschauen ergänzt. Diese Änderung ist separat visuell und funktional abgenommen; Details und neue Belege stehen unten.

Alle technischen und gestalterischen Änderungen zu den 27 Auditpunkten sind umgesetzt und gegen die ursprünglichen Browseraufnahmen geprüft. Die gewählte 65-%-Glasnavigation bleibt erhalten. Es wurden keine verbleibenden relevanten P0/P1/P2-Abweichungen gegenüber diesen Gestaltungszielen festgestellt. Die Abnahme gilt für die lokale Oberfläche und die beschriebenen Tests; freigegebene Portraits und ein finales Studio-Showreel sind weiterhin redaktionelle Inhalte.

## Referenz und tatsächliche Umsetzung

- Ausgangspunkt: [vollständiger GUI-Audit und Umsetzungstabelle G01–G27](docs/gui-analyse-2026-10-08.md), [ursprüngliche Screenshot-Galerie](test-results/gui-audit-2026-10-08/index.html).
- Umsetzung: [24 Schritte mit echten Vorher-/Nachher-Bildern](test-results/gui-all-implementation/rundgang.html). Alle 24 Paarvergleiche wurden visuell betrachtet; zusätzlich Teamprofile, Admin-Badges, Legal-Checks und der vollständige Footer. Die aktualisierten Validierungs-, Fehler- und Erfolgsansichten wurden nach der Fokuskorrektur erneut betrachtet.
- Paarvergleiche sind im Browser gerendert: [Startseite](test-results/gui-all-implementation/qa-step-01.png), [Work](test-results/gui-all-implementation/qa-step-04.png), [Kontakt](test-results/gui-all-implementation/qa-step-09.png), [Formularfehler](test-results/gui-all-implementation/qa-step-10.png), [Erfolg](test-results/gui-all-implementation/qa-step-12.png), [Admin](test-results/gui-all-implementation/qa-step-15.png), [Video-Consent](test-results/gui-all-implementation/qa-step-24.png).
- Gleiche Aufnahmegröße innerhalb jedes Paares, deviceScaleFactor 1: überwiegend 390 × 844 px, Tablet 1024 × 768 px, Consent 320 × 844 px. Die Vergleichsseite skaliert beide Bilder gleichmäßig mit erhaltenem Seitenverhältnis. Keine selektive Bildbearbeitung oder erfundenen Nachher-Ansichten.
- Zustände sind kenntlich gemacht: geöffnetes Menü, Lightbox, Formularvalidierung, simulierter Sendefehler und simulierte Bestätigung. Die Animation ist für Screenshots eingefroren; der konkrete Videoframe kann zwischen Aufnahmen abweichen. Scrollpositionen richten sich nach dem jeweils relevanten Inhalt.
- G06 ist ein isolierter SSR-Komponentenvergleich mit tatsächlichem altem/neuem Consent-Code und identischen aktuellen CSS-Tokens. Er belegt die Text-/Rahmenkorrektur und das fehlende iframe vor Einwilligung; eine vollständige externe Player-Interaktion wurde hier nicht ausgeführt.

## Gestaltungsflächen

| Fläche                 | Ergebnis                                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typografie             | Serifentitel und Markencharakter erhalten. Seitentitel kleiner und adaptiv, lange Wörter passend; wichtige mobile Labels größer und mit geringerer Laufweite. Teamnamen und Rollen sichtbar.                             |
| Layout und Abstände    | Work/Admin ohne Dokumentüberlauf, Hauptinhalte früher sichtbar, Services/Karten/Footer kompakter. Lightbox-Pfeile in derselben Zeile. Tablet-Hero zweispaltig.                                                           |
| Farben und Zustände    | Menü mit 65 % Theme-Tönung, 35 % Durchsicht und 40 px Blur. Invertierte Menü-/Admin-Zustände nutzen passende Textfarben. Fehler und Erfolg haben erkennbare eigene Panels.                                               |
| Bilder und Assets      | Bestehende Bilder und Icons erhalten, Seitenverhältnisse korrekt, keine defekten Bilder in der Matrix. Echtes vorhandenes Portfolio-Still ersetzt das technische Poster. Lokale Projektgalerie zeigt vorhandene Dateien. |
| Inhalte und Hierarchie | Anfrageziele und Standardbezeichnungen vereinheitlicht; Related Work zeigt passende Kategorien. Formular vor Zusatzinformationen, Projektmedium vor Langtext. Redaktionelle Legal-Checks im Admin.                       |

## Messbare Ergebnisse

Bei 390 × 844 px sinkt der Dokumentüberlauf von Work von 440 auf 0 px und beim Admin von 108 auf 0 px. Das erste Kontaktfeld beginnt bei y ≈ 539 statt 929 px; das Projektmedium bei y ≈ 256 statt 692 px. Home sinkt von etwa 6.679 auf 5.409 px Gesamthöhe, Services von 4.126 auf 2.868 px. Der Footer ist etwa 720 statt 1.070 px hoch. Bei 1024 px beginnt das Hero-Medium bei y ≈ 200 statt 621 px.

Die About-Seite ist durch die nun sichtbaren echten Teamdaten länger. Gesamthöhe ist kein isoliertes Qualitätskriterium: zusätzliche relevante Informationen sind beabsichtigt.

Rohmessungen: [vorher](test-results/gui-all-implementation/before.json), [nachher](test-results/gui-all-implementation/after.json).

## Funktion und Regressionen

- **154 Fälle:** elf öffentliche/Admin-Routen × sieben Viewports × zwei Themes. 320 × 568, 390 × 844, 430 × 932, 768 × 1024, 1024 × 768, 1440 × 1000 und 844 × 390. Kein horizontaler Dokumentüberlauf, keine defekten Bilder, keine erfassten JavaScript-pageerrors. [Matrix](test-results/gui-all-implementation/matrix.json).
- **14 weitere Projektfälle** nach Ergänzung des Galerie-Fallbacks: dieselben sieben Größen und beide Themes, ebenfalls ohne Überlauf oder defekte Bilder. [Projektmatrix](test-results/gui-all-implementation/project-matrix.json).
- **Interaktionen in beiden Themes:** beide Home-Anfrageziele, vier korrekte Related-Work-Kategorien, unbekannte Kategorie mit Reset, horizontale Touch-Gesten in Selected Frames/Lightbox/Projektgalerie, normale Bildklicks, Pfeile/Tastatur/Escape, gemeinsame Lightbox-Pfeilzeile, Kontaktvalidierung/Fokus, Werterhalt bei Fehler, fokussierte Bestätigung und erneute Anfrage. Admin-Aktionen oben/unten und begrenzte Tabs geprüft. [Interaktionsbelege](test-results/gui-all-implementation/interactions.json).
- **18 Axe-Zustände** in beiden Themes ohne gemeldete Verstöße in den angewendeten WCAG-Regeltags. Zusätzliche bestehende Accessibility-Tests decken Menü, Lightbox und Formularvalidierung ab. [Axe-Ergebnisse](test-results/gui-all-implementation/axe.json).
- **Weitere Browserprüfungen:** Footer, reguläres Antippen der Projektgalerie, zweispaltiger Tablet-Hero, pausiertes Video bei reduzierter Bewegung und Consent bei 320 px. [Weitere Ergebnisse](test-results/gui-all-implementation/extras.json).
- **Code und Tests:** TypeScript und vollständiges ESLint bestanden; 233 Unit-Tests bestanden. Responsive-, neue GUI- und Accessibility-E2E-Prüfungen bestanden. Drei anfängliche Testfehler wurden nach Prüfung ihrer Ursachen korrigiert: doppelte temporäre Streaming-Knoten, Label-Abfrage einschließlich Pflichtfeldstern und eine bestehende Admin-Logo-Erwartung. Keine offene Testfehlermeldung. Die zehn betroffenen visuellen Referenzen wurden bewusst an das neue Design angepasst.
- **Rundgang:** 24 Schritte, 52 vollständig decodierte eingebettete Bilder; Weiter, Zurück und direkte Schrittwahl bestanden. [Rundgangprüfung](test-results/gui-all-implementation/walkthrough-validation.json).

Alle Browser wurden eigens neu gestartet und verwendeten getrennte Kontexte. Keine vorhandenen Nutzer-Tabs oder Profile verwendet. Formularantworten wurden lokal simuliert und schreibende Anfragen blockiert; keine echten Anfragen verschickt und keine Admin-Inhalte gespeichert.

## Korrekturrunden

1. Änderungen in bestehenden Komponenten umgesetzt; mobile Größen, beide Themes und zentrale Abläufe geprüft.
2. Fehlenden Galerie-Fallback in lokalen Projektdaten gefunden und ergänzt. Touch-Simulation und reguläre Bildklicks getrennt geprüft, weil synthetische CDP-Touches anschließende simulierte Taps auch auf einer unveränderten Kontrollseite unterdrückten.
3. Formularpanels waren bei Fehler/Erfolg durch die bisherige Scrollposition nicht zuverlässig sofort sichtbar. Fokus und unmittelbares Scrollen korrigiert; Feldvalidierung fokussiert das erste ungültige Feld, Sendefehler und Erfolg fokussieren das Panel. Erneute Anfrage fokussiert Name. Beide Themes erneut geprüft und die Rundgangbilder aktualisiert.
4. Rundgang um die tatsächlichen Details unterhalb des Einstiegs ergänzt. Sticky-Navigation bei Vergleichsaufnahmen korrigiert und Schrittwechsel mit sichtbarer Überschrift geprüft.

## Implementierungscheckliste

- [x] Alle 27 GUI-Auditpunkte technisch/gestalterisch bearbeiten; Einzelabnahme im Analysebericht.
- [x] Gewählte transparente Menüvariante erhalten und beide Themes prüfen.
- [x] Öffentliche Seiten und Admin auf Handy, Tablet, Desktop und Querformat prüfen.
- [x] Touch-, Tastatur-, Formular- und Filterabläufe prüfen.
- [x] Bestehende Tests an die beabsichtigte neue Darstellung anpassen und sinnvolle Regressionstests ergänzen.
- [x] Geführten Vorher-Nachher-Rundgang erstellen und alle Vergleiche betrachten.

## Grenzen und noch benötigte Inhalte

Freigegebene echte Team-Portraits und ein endgültiges Studio-Showreel können über die vorhandenen Inhaltswege ergänzt werden. Die vorhandenen Namen, Rollen, Beschreibungen, Videos und Bilder werden bereits sinnvoll dargestellt. Es wurden keine Portraits oder Studio-Arbeiten erfunden.

Die Prüfung nutzt Chromium und simulierte Viewports, keine realen iOS-/Android-Geräte. Safari, Bildschirmtastatur/dynamische Browserleisten, echte Bildschirmleser, hohe Text-/Browservergrößerung und reale Versand-/Speicherprozesse wurden nicht umfassend abgenommen. Transparente Flächen hängen weiterhin vom Hintergrundinhalt ab; CMS-/Produktionsdaten können von lokalen Demo-Inhalten abweichen. Die Tests belegen keine vollständige WCAG-Konformität. Die Website ist lokal geändert, nicht durch diesen Auftrag veröffentlicht.

## Nachiteration: dezente Galerie-Vorschau

**final result: passed**

Ziel ist die Tiefe der ursprünglichen mobilen Galerie mit zurückhaltenderen Vorschauen. Zwei leicht abgedunkelte Nachbarbilder schauen seitlich und nach unten versetzt hinter dem Hauptbild hervor. Sie sind antippbar. Bei 390 px Bildschirmbreite ist das Hauptbild 326 px breit: größer als ursprünglich 304 px, mit je 16 px seitlichem Raum gegenüber der ersten Überarbeitung ohne Vorschau. Die Galerie benötigt gegenüber dieser Zwischenfassung 36 px mehr Höhe; Home ist jetzt 5.409 px hoch.

Visuell betrachtet wurden die gerenderten Paarvergleiche [dunkel](test-results/gallery-preview-2026-10-08/qa-comparison-gpt-vintage.png) und [hell](test-results/gallery-preview-2026-10-08/qa-comparison-vintage-light.png) sowie der [Detailvergleich mit der ursprünglichen Galerie](test-results/gallery-preview-2026-10-08/qa-original-detail.png). Die Vollansichten verwenden jeweils 390 × 844 px bei deviceScaleFactor 1 und denselben Galerie-/Scrollzustand. Im Detail sind die Bildbühnen am oberen Rand ausgerichtet; der ursprüngliche Zähler liegt außerhalb des Originalausschnitts. Das teilweise vom Sticky-Header verdeckte Heading in den Vollansichten gehört zum aufgenommenen Scrollzustand.

| Gestaltungsfläche   | Ergebnis                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schrift und Inhalte | Vorhandene Überschrift, Beschriftungen und Zähler erhalten; keine zusätzlichen Beschriftungen über den Vorschauen.                                             |
| Layout und Abstände | Größeres Hauptbild als im Original, kleinere herausragende Nachbarbilder, freier Zähler darunter. Kein Dokumentüberlauf in zehn geprüften Theme-/Größenfällen. |
| Farben und Tokens   | Bestehende Theme-Farben, Bildrahmen und Icons erhalten. Mobile Vorschauen mit 70 % Deckkraft, beim Fokus vollständig sichtbar.                                 |
| Bilder und Qualität | Tatsächliche vorherige/nächste Galerie-Dateien, passende Bildgrößen und unverzerrte Seitenverhältnisse; keine neuen Assets.                                    |
| Interaktion         | Die sichtbare untere Vorschaufläche ist bei 320/390/430 px mindestens 44 px hoch. Vorschau-Klicks, Hauptbild/Lightbox und Wischen in beiden Themes bestanden.  |

Die Nachprüfung umfasst 320, 390, 430, 768 und 1440 px in beiden Themes. Zusätzlich bestanden Tastaturbedienung bei reduzierter Bewegung, gezielte Axe-Prüfungen der Galerie, TypeScript, ESLint und vier bestehende Galerie-/Lightbox-E2E-Tests; zwei Fälle wurden gemäß dem Viewport-Scope regulär übersprungen. Rohdaten: [vorher](test-results/gallery-preview-2026-10-08/before.json), [nachher](test-results/gallery-preview-2026-10-08/after.json), [aktuelle Home-Messung](test-results/gallery-preview-2026-10-08/home-metrics.json). Die zwei mobilen Home-Referenzen wurden an diese beabsichtigte Änderung angepasst; beide visuellen Tests bestanden.

Keine offenen P0/P1/P2-Befunde in diesem Umfang. Eine Abnahme auf realen Touch-Geräten bleibt Teil der oben genannten Grenzen.
