# Aufgabe: Cinematic Motion Layer für die bestehende Landingpage

Analysiere zuerst das vollständige bestehende Website-Projekt und insbesondere die aktuelle Landingpage.

## Oberstes Ziel

Die **bestehende Landingpage ist die verbindliche Design- und Content-Referenz und darf nicht verändert werden**.

Ich möchte auf Basis dieser bestehenden Landingpage eine zusätzliche hochwertige Motion-/Animationsschicht entwickeln.

Als stilistische Referenz für die Art der Animationen kann folgende Website analysiert werden:

**https://landonorris.com/**

Wichtig:

- NICHT das Design von Lando Norris kopieren.
- NICHT Farben, Typografie, Layout oder Branding kopieren.
- Nur Prinzipien wie cinematic scrolling, reveal animations, scroll-driven transitions, image scaling, masking, pacing und hochwertige Page Motion als Inspiration verwenden.
- Das bestehende Lux-Studio-Design bleibt vollständig erhalten.
- Die Animationen müssen zur Marke Lux Studio und deren Film-/Fotografie-Charakter passen.

---

# 1. Bestehende Landingpage schützen

Die aktuelle Landingpage ist der Referenzzustand.

Sie darf hinsichtlich

- Layout
- Inhalte
- Typografie
- Abstände
- Farben
- Bilder
- Videos
- Navigation
- Responsive-Verhalten
- Komponentenstruktur, soweit nicht technisch zwingend erforderlich

nicht verändert oder redesignend angepasst werden.

## Besonders wichtig

Keine bestehende Datei oder Komponente soll unnötig umgebaut werden, nur damit Animationen möglich werden.

Bevor du Änderungen vornimmst:

1. analysiere die bestehende Architektur,
2. identifiziere die Landingpage,
3. identifiziere wiederverwendbare Komponenten,
4. identifiziere CSS-/Styling-System,
5. identifiziere Framework und Build-System,
6. dokumentiere kurz, wie du die Animationen möglichst isoliert ergänzen kannst.

Wenn möglich, implementiere die Motion-Funktionalität als **separate Motion Layer / Animation Module**.

---

# 2. Globaler Motion-Schalter

Ich möchte einen sichtbaren Schalter zum Aktivieren und Deaktivieren der Animationen.

Beispielsweise:

```text
Motion

[ OFF | ON ]
```

oder ein optisch zum bestehenden Design passender Toggle.

## Verhalten

### Motion OFF

Die Seite muss sich praktisch exakt so verhalten wie die derzeitige Landingpage.

Keine:

- ScrollTrigger Animationen
- Text Reveals
- Parallax-Effekte
- Image Scaling
- Scroll-Scrubbing
- Pinned Sections
- animierten Page Transitions

Normales Browsing und normales Scrollen.

### Motion ON

Die neuen Cinematic-Motion-Funktionen werden aktiviert.

---

# 3. Architektur des Toggles

Der Schalter darf nicht dazu führen, dass zwei komplett unabhängige Websites gepflegt werden müssen.

Bevorzugte Architektur:

```text
bestehende Landingpage
        │
        ↓
bestehende Komponenten
        │
        ├── Motion OFF
        │      → normale Darstellung
        │
        └── Motion ON
               → zusätzliche Motion Layer
```

Animationen sollen möglichst über:

- Wrapper
- Hooks
- Utilities
- Animation Controller
- GSAP Context
- Animation Presets

ergänzt werden.

Nicht die Landingpage duplizieren, wenn es technisch sauber vermeidbar ist.

---

# 4. Persistenz des Schalters

Speichere die Auswahl lokal im Browser, z. B. über:

```text
localStorage
```

Beispiel:

```text
lux-motion-enabled
```

Beim erneuten Laden soll die gewählte Einstellung erhalten bleiben.

---

# 5. prefers-reduced-motion

Accessibility ist zwingend zu berücksichtigen.

Wenn der Browser meldet:

```css
prefers-reduced-motion: reduce
```

dann sollen komplexe Animationen standardmäßig deaktiviert oder stark reduziert werden.

Der Benutzer darf sie bei Bedarf weiterhin bewusst aktivieren, sofern dies sinnvoll umgesetzt werden kann.

---

# 6. Motion-Konzept

Ich möchte keine überladene Effekt-Website.

Die Animationen sollen:

- hochwertig
- cinematic
- ruhig
- kontrolliert
- präzise
- modern
- performant

wirken.

Lux Studio verkauft Film, Fotografie und visuelles Storytelling.

Der Content selbst muss deshalb immer im Vordergrund bleiben.

---

# 7. Motion Level

Ziel ist ungefähr:

```text
Motion Level 3 – Cinematic
```

Noch kein unnötiges Three.js/WebGL.

Bevorzugter Stack:

```text
GSAP
GSAP ScrollTrigger
GSAP SplitText
GSAP Flip
```

Falls einzelne Funktionen mit nativen Browser-APIs oder CSS besser umgesetzt werden können, verwende diese.

Three.js / WebGL nur dann hinzufügen, wenn es später einen konkreten gestalterischen Nutzen gibt.

Für diese erste Version NICHT erforderlich.

---

# 8. Hero Section

Der Hero soll die erste deutlich wahrnehmbare Motion-Komponente bekommen.

Ziel:

```text
Page Load

LUX STUDIO / Hero Text
        ↓
subtiler Mask-/Reveal-Effekt
        ↓
Bild bzw. Video wird sichtbar
        ↓
Scroll
        ↓
leichte Skalierung / Bewegung
        ↓
fließender Übergang zur nächsten Section
```

Keine lange Introanimation.

Der Benutzer muss sofort mit der Seite interagieren können.

Initiale Animation ungefähr im Bereich:

```text
0,5–1,5 Sekunden
```

je nach bestehender Gestaltung.

---

# 9. Text Reveals

Wichtige Headlines dürfen cinematic revealed werden.

Bevorzugt:

- line reveal
- word reveal
- masked vertical reveal
- leichter stagger

Beispiel:

```text
CINEMATIC
STORYTELLING
```

nicht einfach:

```text
opacity 0 → 1
```

sondern hochwertiger Mask-Reveal.

GSAP SplitText kann dafür verwendet werden, falls sinnvoll.

Animationen nicht auf jeden Absatz anwenden.

Nur wichtige Headlines und ausgewählte Textelemente.

---

# 10. Bild- und Video-Reveals

Projektbilder und Videos sollen subtil auf Scroll reagieren können.

Geeignete Presets:

```text
imageReveal
imageScale
imageParallax
clipReveal
videoReveal
```

Beispiel:

```text
Container bleibt gleich

Bild:
scale 1.06 → 1.00

Clip:
inset / mask reveal

Position:
leichte vertikale Bewegung
```

Keine extremen Zooms.

---

# 11. Selected Work / Featured Projects

Dieser Bereich soll einer der stärksten Motion-Bereiche werden.

Prüfe, wie die aktuelle Section aufgebaut ist.

Entwickle daraus eine cinematic Präsentation, ohne ihr bestehendes visuelles Design zu zerstören.

Mögliche Interaktion:

```text
Projekt 01
        ↓
Scroll
        ↓
Bild/Video verändert sich subtil
Titel bewegt/revealt
        ↓
Projekt 02
        ↓
Projekt 03
```

Optional kann ein Teil des Bereichs temporär gepinnt werden.

GSAP ScrollTrigger:

```text
pin
scrub
timeline
```

dürfen hierfür eingesetzt werden.

Aber:

Pinned Sections nur verwenden, wenn es UX-seitig tatsächlich besser wirkt.

Keine unnötig langen Scrollwege.

---

# 12. Frames In Motion

Falls eine entsprechende Video-/Projektsektion vorhanden ist, soll diese besonders hochwertig inszeniert werden.

Möglicher Ablauf:

```text
Video / Projekt 01
        ↓
Scroll
        ↓
leichter Zoom
        ↓
Text masked out
        ↓
Crossfade / Reveal
        ↓
Projekt 02
```

Bestehende Videos und Bilder verwenden.

Keine künstlichen Assets erzeugen.

---

# 13. Projektkarten Hover

Projektkarten können eine dezente Hover-Interaktion bekommen.

Beispiel:

```text
Image scale:
1.00 → 1.02 / 1.03

Text:
leichte Bewegung

Cursor:
optional "View Project"
```

Falls Videos für einzelne Projekte vorhanden und technisch geeignet sind, kann optional beim Hover ein kurzer Preview-Loop verwendet werden.

Aber nur:

- lazy loaded
- performant
- ohne Layout Shift
- ohne Autoplay-Audio

---

# 14. Work Filter

Falls die Work-/Portfolio-Seite Filter verwendet, prüfe eine Animation mit:

```text
GSAP Flip
```

Beim Wechsel von:

```text
ALL
```

zu:

```text
AUTOMOTIVE
```

sollen verbleibende Projekte flüssig ihre neue Position einnehmen.

Entfernte Projekte:

```text
fade / scale out
```

Verbleibende Projekte:

```text
smooth repositioning
```

---

# 15. Page-/Project-Transitions

Prüfe als weitere Premium-Funktion:

```text
Portfolio Card
        ↓ click
Thumbnail expandiert
        ↓
Projekt Hero
```

Das Ziel ist eine Shared-Element-artige Transition.

Mögliche Technik:

```text
GSAP Flip
```

oder eine bessere zum bestehenden Framework passende Lösung.

Wichtig:

Diese Funktion zunächst sauber isolieren.

Wenn sie aufgrund der bestehenden Router-/Framework-Architektur riskant oder unnötig komplex wird, dokumentiere das zunächst und implementiere sie erst nach den grundlegenden Motion-Funktionen.

---

# 16. Navigation

Falls passend, animiere das Menü sehr subtil.

Beispielsweise:

```text
WORK
SERVICES
ABOUT
CONTACT
```

erscheinen mit:

```text
masked line reveal
+
stagger
```

Keine übertriebene Fullscreen-Animation, wenn sie nicht zum bestehenden Menü passt.

---

# 17. Motion Library

Bitte Animationen nicht verteilt als einzelne Ad-hoc-GSAP-Aufrufe in Komponenten schreiben.

Baue eine kleine wiederverwendbare Motion-Library.

Sinngemäß:

```text
/src
   /motion

      motionManager
      motionConfig

      /presets

         fade
         reveal
         stagger
         textReveal

         imageReveal
         imageScale
         parallax
         clipReveal

         pinnedSection
         horizontalScroll

         pageTransition

      /utils

         reducedMotion
         cleanup
         viewport
```

Passe die Struktur an den vorhandenen Stack an.

Keine Struktur erzwingen, wenn das Projekt bereits eine sinnvollere Architektur besitzt.

---

# 18. Motion Manager

Es soll eine zentrale Instanz geben, die weiß:

```text
motionEnabled = true / false
```

Komponenten sollen nicht selbst `localStorage` prüfen.

Beispielsweise:

```text
MotionProvider

oder

useMotion()

oder

MotionManager
```

abhängig vom bestehenden Framework.

---

# 19. Sauberes Cleanup

Sehr wichtig bei GSAP.

Alle:

- ScrollTrigger
- Timelines
- Event Listener
- requestAnimationFrame
- Observer

müssen beim:

- Deaktivieren von Motion
- Route Change
- Component Unmount

sauber entfernt werden.

Keine doppelten ScrollTrigger nach mehrfach ON/OFF.

---

# 20. Umschalten während die Seite geöffnet ist

Der Benutzer soll Motion während des Betriebs aktivieren oder deaktivieren können.

Beispiel:

```text
Motion ON
↓
Animationen laufen

Toggle OFF
↓
alle GSAP Timelines stoppen
ScrollTrigger entfernen
Styles normalisieren
Seite bleibt benutzbar
```

und:

```text
Motion OFF
↓
Toggle ON
↓
Animationen werden korrekt initialisiert
```

Kein Reload erforderlich, sofern technisch sinnvoll.

---

# 21. Performance

Performance hat hohe Priorität.

Animation möglichst über:

```text
transform
opacity
clip-path
```

Keine unnötigen Animationen von:

```text
width
height
top
left
```

wenn dadurch Layout-Reflows entstehen.

Vermeide:

- Layout Thrashing
- unnötige Scroll Listener
- große JS Bundles
- unnötige Video Downloads
- dauerhaft aktive requestAnimationFrame-Loops

---

# 22. Mobile

Desktop und Mobile getrennt betrachten.

Eine Animation, die auf Desktop gut aussieht, muss nicht auf Mobile übernommen werden.

Für Mobile:

- weniger Parallax
- weniger Pinning
- weniger Scrubbing
- kürzere Animationen
- kleinere Bewegungsdistanzen

verwenden.

Performance und Bedienbarkeit haben Vorrang.

---

# 23. SEO / LCP / CLS

Animationen dürfen nicht negativ beeinflussen:

- SEO
- Largest Contentful Paint
- Cumulative Layout Shift
- First Contentful Paint
- Accessibility

Wichtiger Content muss im HTML vorhanden bleiben.

Keine Inhalte ausschließlich durch JavaScript erzeugen.

Hero-Animation darf LCP nicht unnötig verzögern.

---

# 24. Keine Animation um der Animation willen

Jede Animation muss mindestens einen dieser Zwecke erfüllen:

1. Blickführung
2. Hierarchie
3. Storytelling
4. Übergang
5. räumliches Verständnis
6. hochwertigere Präsentation von Bild/Video

Wenn keiner dieser Punkte erfüllt ist:

Animation weglassen.

---

# 25. Kein Redesign

Extrem wichtig:

Nicht eigenmächtig verändern:

- Fonts
- Font Sizes
- Farben
- Border Radius
- Grid
- Abstände
- Bilder
- Seiteninhalte
- Navigation
- Logos
- Branding

Nur weil eine Animation damit vermeintlich besser aussehen würde.

Die bestehende Website ist die Designreferenz.

---

# 26. Referenz Lando Norris

Analysiere:

https://landonorris.com/

ausschließlich hinsichtlich:

- Pacing
- Scroll-Verhalten
- Mask-Reveals
- Textbewegungen
- Bildbewegungen
- Section Transitions
- Cinematic Presentation
- Pinning
- Scroll Scrubbing
- Motion Hierarchy

Nicht kopieren:

- Branding
- Layout
- Assets
- Texte
- spezifische kreative Gestaltung
- 3D-Objekte

Wir wollen das Prinzip:

```text
High-end cinematic web experience
```

auf die bestehende Lux-Studio-Ästhetik übertragen.

---

# 27. Vorgehensweise

Arbeite schrittweise.

## Phase 1 – Analyse

Zuerst:

- Stack analysieren
- Landingpage analysieren
- vorhandene Komponenten analysieren
- vorhandene Animationen analysieren
- mögliche Integrationspunkte identifizieren

Danach kurz dokumentieren:

```text
Current architecture
Motion integration approach
Files/components affected
Dependencies required
Potential risks
```

---

## Phase 2 – Motion Foundation

Implementieren:

1. Motion State
2. Motion Toggle
3. localStorage
4. prefers-reduced-motion
5. GSAP Initialisierung
6. ScrollTrigger Setup
7. Cleanup
8. Motion Utilities

---

## Phase 3 – Basic Motion

Implementieren:

1. Hero Reveal
2. Text Reveal
3. Image Reveal
4. Image Scale
5. dezenter Parallax

Danach Build und Funktion testen.

---

## Phase 4 – Cinematic Sections

Danach:

1. Selected Work
2. Frames In Motion
3. Project Cards
4. Navigation

---

## Phase 5 – Advanced

Erst anschließend prüfen:

1. GSAP Flip Portfolio Filter
2. Shared Project Transition
3. komplexeres Pinning
4. eventuell später WebGL

---

# 28. Testanforderungen

Teste mindestens:

```text
Desktop Chrome
Desktop Edge

Mobile viewport
Tablet viewport
Desktop viewport
```

Prüfe:

- Motion ON
- Motion OFF
- Reload mit Motion ON
- Reload mit Motion OFF
- mehrfaches ON/OFF
- Route Change
- Browser Back
- prefers-reduced-motion
- Resize
- Mobile Navigation

---

# 29. Build

Nach jeder größeren Phase:

- Build ausführen
- Lint ausführen
- vorhandene Tests ausführen
- Browser-/Runtime-Fehler prüfen

Keine bestehenden Fehler stillschweigend ignorieren.

Falls bereits vor der Änderung Fehler vorhanden waren:

klar unterscheiden zwischen

```text
pre-existing
```

und

```text
introduced by this change
```

---

# 30. Git

Keine großen unübersichtlichen Änderungen.

Sinnvolle kleine Arbeitsschritte.

Keine bestehenden Dateien löschen oder überschreiben, wenn es nicht notwendig ist.

Keine bestehende funktionierende Landingpage zerstören.

---

# 31. Gewünschtes Endergebnis

Am Ende möchte ich:

```text
Lux Studio Website
│
├── bestehendes Design
│
├── bestehender Content
│
└── Motion Layer
      │
      ├── OFF
      │    └── praktisch bisherige Website
      │
      └── ON
           ├── cinematic hero
           ├── text reveals
           ├── image reveals
           ├── subtle parallax
           ├── cinematic projects
           ├── smooth transitions
           └── premium motion
```

Der Benutzer soll direkt zwischen beiden Varianten vergleichen können.

---

# 32. Entscheidungsregel

Wenn du während der Implementierung vor der Wahl stehst zwischen:

```text
mehr Effekt
```

und

```text
mehr Eleganz
```

wähle:

**mehr Eleganz.**

Wenn du vor der Wahl stehst zwischen:

```text
beeindruckender Animation
```

und

```text
besserer UX / Performance
```

wähle:

**bessere UX / Performance.**

Das Ziel ist nicht eine Demo für GSAP.

Das Ziel ist eine hochwertige, cinematic Website für eine professionelle Film- und Fotoproduktion.