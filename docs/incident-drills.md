# Incident and Recovery Drills

Stand: 13. August 2026

## Zweck

Diese drei Übungen sind dokumentiert, aber bislang nicht real durchgeführt.
Ein Verfahren, das nur auf dem Papier existiert, ist im echten Vorfall nicht
vertrauenswürdig. Jede Übung braucht ein tatsächliches Datum, eine
verantwortliche Person und ein dokumentiertes Ergebnis, bevor sie als
verlässlich gelten kann.

Empfohlener Rhythmus: alle drei Übungen mindestens einmal pro Quartal, sowie
zusätzlich vor jedem größeren Infrastruktur- oder Auth-Wechsel.

## 1. Restore-Drill (Supabase Backup/PITR)

Voraussetzung: Backup/PITR ist aktiviert (siehe „Externe Freigaben" in
`software-improvement-roadmap.md`).

1. Aktuellen Backup-/PITR-Status in der Supabase-Konsole festhalten
   (Zeitpunkt des letzten Backups, verfügbares PITR-Fenster).
2. In einem **separaten, nicht-produktiven** Supabase-Projekt oder einer
   lokalen Instanz aus einem Backup/PITR-Punkt wiederherstellen.
3. Gegen die Kernprüfungen aus `database-operations.md` verifizieren:
   `projects`, `site_settings`, `inquiries` vorhanden und konsistent;
   `supabase db lint --local --fail-on error` läuft grün.
4. Zeit von „Vorfall erkannt" bis „Restore verifiziert" messen.
5. Ergebnis in der Tabelle unten festhalten, inklusive aufgetretener
   Probleme und ob das Zeitziel (RTO) eingehalten wurde.

**Niemals gegen das produktive Projekt ausführen.**

## 2. Auth-Konfigurationsprüfung

1. In der Supabase-Konsole prüfen: öffentliche Signups deaktiviert, MFA-Option
   für Admin-Konten aktiv, Passwortregeln und Session-Limits wie in
   `live-launch-checklist.md` gefordert, `admin_users`-Allowlist enthält nur
   aktuell berechtigte Personen.
2. Mit einem nicht gelisteten Testkonto einen Anmeldeversuch simulieren und
   bestätigen, dass `is_admin()` und die Admin-Workspace-Prüfung ihn ablehnen.
3. Abweichungen sofort korrigieren, nicht nur dokumentieren.

## 3. Incident-Tabletop

Eine 30–45-minütige Besprechung ohne echten Vorfall, anhand eines
angenommenen Szenarios (z. B. „Service-Role-Key wurde geleakt" oder
„Inquiry-Tabelle zeigt unerwartete Löschungen"):

1. Wer bemerkt es zuerst, über welchen Kanal (strukturierte Logs/Events aus
   `quality-and-observability.md`)?
2. Wer hat die Berechtigung, den Service-Role-Key zu rotieren bzw. Schreibzugriff
   zu sperren?
3. Welcher Schritt aus `database-operations.md` (Rollback-Strategie,
   Restore) greift zuerst?
4. Wer informiert extern (Kunden, Aufsichtsbehörde bei einem
   datenschutzrelevanten Vorfall), und innerhalb welcher Frist?

Ergebnis: eine kurze Liste konkreter Lücken (fehlende Kontaktdaten, unklare
Zuständigkeit, fehlender Zugriff), keine Prosa-Zusammenfassung.

## Durchführungsprotokoll

| Datum                     | Übung | Verantwortlich | Ergebnis | Offene Punkte |
| ------------------------- | ----- | -------------- | -------- | ------------- |
| _noch keine Durchführung_ |       |                |          |               |

Jede Zeile hier ist ein tatsächlich stattgefundenes Ereignis, kein geplantes.
Ein leerer Tabellenkörper bedeutet ehrlich: noch nie durchgeführt.
