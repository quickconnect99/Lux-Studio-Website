# Legal Livegang

Diese Codebasis enthaelt jetzt die fuer den aktuellen Projektstand sinnvollen
rechtlichen Mindestbausteine:

- `/impressum`
- `/datenschutz`
- Footer-Links auf beide Seiten
- Kontaktformular mit Datenschutzhinweis
- Externe Videos von YouTube/Vimeo werden erst nach aktivem Klick geladen

## Wichtig vor dem echten Livegang

Die Seiten sind absichtlich als belastbare Vorlage umgesetzt, enthalten aber an
einigen Stellen noch Platzhalter. Diese muessen vor dem Deployment mit den
echten Unternehmensdaten ersetzt werden.

Pfad:

- `lib/legal.ts`

Mindestens ausfuellen:

- `legalForm`
- `representative`
- `streetAddress`
- `postalCode`
- `city`
- `country`
- `mediaOwner`
- `editorialResponsibility`
- `hostingProviderName`
- `hostingProviderLocation`
- `databaseProviderLocation`

Optional, aber oft relevant:

- `registerCourt`
- `registerNumber`
- `vatId`
- `supervisoryAuthority`
- `chamberOrProfessionalAssociation`
- `professionalTitle`
- `privacyContactEmail`

## Warum kein Cookie-Banner eingebaut wurde

Im aktuellen Code gibt es keinen sichtbaren Einsatz von Analytics,
Marketing-Pixeln oder aehnlichen Tracking-Tools.

Aktuell relevant sind nur:

- lokal gespeicherte Theme-Praferenz
- externe Video-Embeds

Die Video-Embeds werden deshalb erst nach Nutzeraktion geladen. Damit werden
keine Drittanbieter-Requests bereits beim initialen Seitenaufruf ausgeloest.

## Wann du trotzdem einen echten Cookie-Banner brauchst

Sobald du eines der folgenden Dinge einbaust, brauchst du sehr wahrscheinlich
einen vollwertigen Consent-Mechanismus vor dem Laden:

- Google Analytics / GA4
- Google Tag Manager
- Meta Pixel
- Microsoft Clarity
- Hotjar
- LinkedIn Insight Tag
- Remarketing- oder Advertising-Tags
- eingebettete Inhalte, die ohne vorherige Nutzeraktion direkt laden

Dann reicht die aktuelle Loesung nicht mehr aus.

## Warum keine AGB angelegt wurden

Fuer die aktuelle Website ist kein Checkout, kein Warenkorb, keine bindende
Online-Buchung und kein sonstiger Online-Vertragsschluss sichtbar. Deshalb
wurden bewusst keine AGB als Standardseite erzeugt.

AGB solltest du erst dann aufnehmen, wenn die Website tatsaechlich
vertragsrelevante Online-Prozesse enthaelt, zum Beispiel:

- verbindliche Bestellungen
- Online-Zahlungen
- zahlungspflichtige Buchungen
- digitale Produkte / Downloads
- verbindliche Vertragsannahmen ueber die Website

## Projektdateien

Relevante Dateien der Umsetzung:

- `app/impressum/page.tsx`
- `app/datenschutz/page.tsx`
- `components/legal/embedded-video-consent.tsx`
- `components/sections/project-media.tsx`
- `components/sections/inquiry-form.tsx`
- `components/layout/site-footer.tsx`
- `lib/legal.ts`

## Juristische Einordnung

Die Umsetzung ist technisch und inhaltlich auf einen DACH-/EU-konformen
Minimalstand fuer eine Portfolio-/Kontaktseite ausgerichtet. Sie ersetzt keine
individuelle Rechtsberatung. Wenn dein Unternehmenssitz, deine Zielmaerkte oder
deine Prozesse von diesem Setup abweichen, musst du die Seiten entsprechend
anpassen.
