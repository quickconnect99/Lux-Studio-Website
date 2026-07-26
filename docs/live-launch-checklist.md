# Live Launch Checklist

## 1. Supabase

- SQL aus `supabase/schema.sql` im SQL Editor ausfuehren
- pruefen, dass der Bucket `projects` existiert und public ist
- in Auth mindestens einen Admin-User anlegen
- UUID des Admin-Users in `public.admin_users` eintragen
- `site_settings` mit echten Brand-/Kontaktdaten fuellen
- pruefen, dass `public.consume_inquiry_rate_limit(...)` existiert und nur
  `service_role` darauf zugreifen kann

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
```

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
- Kontaktformular speichert eine Anfrage
- API-Antworten enthalten einen `x-request-id`-Header
- Function-Logs enthalten nach der Migration kein
  `inquiry.rate_limit_fallback`

## 5. Sicherheitsnachlauf

- Git-Remote ohne eingebetteten Token konfigurieren
- GitHub-Token rotieren, falls noch aktiv
- starke Supabase-Passwoerter verwenden und `public.admin_users` regelmaessig pruefen
