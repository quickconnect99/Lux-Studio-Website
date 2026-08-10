# Live Launch Checklist

## 1. Supabase

- [ ] alle versionierten Migrationen aus `supabase/migrations` bis
      `20260801000200` anwenden
- [ ] `npm run migrations:check` ausfuehren
- pruefen, dass der Bucket `projects` existiert und public ist
- in Auth mindestens einen Admin-User anlegen
- UUID des Admin-Users in `public.admin_users` eintragen
- `site_settings` mit echten Brand-/Kontaktdaten fuellen
- pruefen, dass `public.consume_inquiry_rate_limit(...)` existiert und nur
  `service_role` darauf zugreifen kann
- pruefen, dass `public.delete_expired_inquiries(...)` und
  `public.claim_inquiry_notifications(...)` nur fuer `service_role`
  ausfuehrbar sind

## 2. Vercel

- GitHub-Repo in Vercel importieren
- folgende Environment Variables in `Production` setzen:

```env
NEXT_PUBLIC_SITE_URL=https://deine-domain.tld
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=projects
NEXT_PUBLIC_ENABLE_ADMIN=true
NEXT_PUBLIC_SHOW_ADMIN_LINK=false
NEXT_PUBLIC_ENABLE_TELEMETRY=false
INQUIRY_RATE_LIMIT_SECRET=<mindestens-32-zufaellige-zeichen>
TRUSTED_PROXY_IP_HEADER=x-vercel-forwarded-for
INQUIRY_RETENTION_DAYS=365
INQUIRY_EMAIL_TIMEOUT_MS=8000
CRON_SECRET=<mindestens-32-zufaellige-zeichen>
SMTP_HOST=<optional, z.B. smtp.deinprovider.tld>
SMTP_PORT=587
SMTP_USER=<nur-gemeinsam-mit-smtp-host>
SMTP_PASSWORD=<nur-gemeinsam-mit-smtp-host>
INQUIRY_EMAIL_TO=<nur-gemeinsam-mit-smtp-host>
INQUIRY_EMAIL_FROM=<optionaler-absender, faellt sonst auf SMTP_USER zurueck>
```

- `npm run env:check` mit den Production-Werten ausfuehren; `npm run build`
  fuehrt denselben Fail-Closed-Check automatisch vor Next.js aus
- im Vercel-Projekt pruefen, dass beide Cron-Jobs aus `vercel.json` vom
  gebuchten Plan unterstuetzt und aktiviert werden

## 3. Domain

- Primary Domain in Vercel setzen
- `NEXT_PUBLIC_SITE_URL` exakt auf diese Domain abstimmen
- DNS propagieren lassen

## 4. Smoke Test

Nach dem ersten Production Deployment:

```bash
npm run smoke:live -- https://deine-domain.tld
```

Zusatzchecks im Browser:

- `/admin` zeigt den Supabase-Login
- nur User aus `public.admin_users` koennen Inhalte verwalten
- Bild-Upload im Admin funktioniert
- neue Bilder werden auf den Projektseiten korrekt gerendert
- Shot With Intent und Frames in Motion speichern Auswahl, Reihenfolge und
  Projektlinks nach einem Reload korrekt
- ersetzte Medien bleiben nur erhalten, wenn sie noch an anderer Stelle
  referenziert werden
- Kontaktformular speichert eine Anfrage
- API-Antworten enthalten einen `x-request-id`-Header
- Function-Logs enthalten nach der Migration kein
  `inquiry.rate_limit_fallback`
- eine Testanfrage erreicht `notification_status = 'sent'` oder bei
  bewusst deaktivierter E-Mail-Zustellung `notification_status = 'skipped'`
- ein kontrolliert fehlgeschlagener Versand wird hoechstens fuenfmal erneut
  versucht; Cron-Logs enthalten keine Formularinhalte
- der Retention-Cron loescht einen eigens angelegten, abgelaufenen Testdatensatz

## 5. Sicherheitsnachlauf

- Git-Remote ohne eingebetteten Token konfigurieren
- GitHub-Token rotieren, falls noch aktiv
- starke Supabase-Passwoerter verwenden und `public.admin_users` regelmaessig pruefen

## 6. Externe Launch-Gates

Diese Punkte koennen nicht im Repository ausgefuehrt oder als erledigt
behauptet werden. Der Livegang bleibt blockiert, bis fuer jeden Punkt
nachvollziehbare Evidenz vorliegt:

- [ ] Supabase Backup/PITR aktivieren und einen Restore in ein isoliertes
      Projekt erfolgreich testen
- [ ] offene Auth-Signups im Production-Projekt deaktivieren, Admin-Userliste
      pruefen und MFA fuer alle Admins aktivieren
- [ ] Supabase-, Vercel- und E-Mail/SMTP-Provider-Regionen sowie DPA/SCC/AV-Vertraege pruefen
- [ ] Aufbewahrung im Empfaenger-Postfach auf die freigegebene Frist abstimmen
- [ ] finale Rechtsfreigabe fuer Impressum, Datenschutzerklaerung,
      Rechtsgrundlagen und Aufbewahrungsfrist dokumentieren
- [ ] Vercel-Plan und Cron-Ausfuehrung fuer 15-Minuten-Retries sowie taegliche
      Retention verifizieren
