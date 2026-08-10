# Supabase Production Setup

Diese Website erwartet fuer den Live-Betrieb die folgenden Supabase-Werte:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` falls der Bucket nicht `projects` heisst

## Was du im Supabase-Dashboard holen musst

1. `Project URL`
2. `anon public key`
3. `service_role secret key`
4. Region des Projekts fuer Impressum / Datenschutz
5. Einen Admin-User in Auth:
   Dazu brauchst du nur E-Mail + Passwort, damit du dich unter `/admin` anmelden kannst.
6. Diesen ersten User in `public.admin_users` eintragen (einmalig per SQL, da noch
   niemand eingeloggt ist, der ihn im Admin-Panel freischalten koennte):

```sql
insert into public.admin_users (user_id)
values ('<auth-user-uuid>')
on conflict (user_id) do nothing;
```

Ein Auth-User ohne Eintrag in `public.admin_users` kann sich authentifizieren,
aber keine Projekte, Anfragen, Site Settings oder Storage-Dateien verwalten. Er
sieht nach dem Login sofort die Meldung "This Supabase account is not
authorized for the admin workspace." und wird automatisch wieder ausgeloggt.

Jeden weiteren Admin (z.B. neue Teammitglieder) schaltest du **nicht mehr per
SQL** frei, sondern im Admin-Panel selbst: Tab "Admin Access" zeigt jeden
Supabase-Account, der sich schon einmal versucht hat einzuloggen, mit dem
Status "Pending" oder "Admin" an. Ein Klick auf "Approve" traegt den Account in
`public.admin_users` ein; "Revoke access" entfernt ihn wieder. Der Account muss
vorher trotzdem in Supabase Auth existieren (Dashboard oder eigener Sign-up-Flow) -
das Admin-Panel legt keine neuen Auth-User an, es verwaltet nur den Zugriff.

## Was du in Supabase anlegen musst

1. SQL aus `supabase/schema.sql` ausfuehren
2. Public Storage Bucket `projects` anlegen
3. Im Bucket die Dateien in diese Pfade hochladen lassen:
   `covers/`, `gallery/`, `videos/`
4. Jeden CMS-Admin explizit in `public.admin_users` freischalten

## Wichtiger Unterschied zum alten Setup

Kontaktanfragen laufen jetzt ueber den Server-Endpoint `/api/inquiries`.
Dafuer wird `SUPABASE_SERVICE_ROLE_KEY` auf dem Server benoetigt.

Der Vorteil:

- kein direkter Browser-Insert mehr in `inquiries`
- einfache Bot-Bremse vor dem Datenbank-Write
- einfachere spaetere Erweiterung fuer Turnstile / Mailversand / Webhooks

Das aktuelle Schema legt ausserdem `public.inquiry_rate_limits` und die
Service-Role-Funktion `public.consume_inquiry_rate_limit(...)` an. Die Route
speichert dort nur einen mit `INQUIRY_RATE_LIMIT_SECRET` erzeugten HMAC der
vom konfigurierten Reverse Proxy gelieferten IP-Adresse, niemals die rohe
IP-Adresse oder den User-Agent.

Solange diese Migration in einem bestehenden Projekt noch nicht angewendet
wurde, verwendet die Route nur in Entwicklung und Tests das lokale
In-Memory-Limit. Production schlaegt bei einem nicht verfuegbaren persistenten
Limiter mit einer generischen `503` und `Retry-After` fehl.

Die Migrationen `20260801000100` und `20260801000200` ergaenzen:

- automatische, konfigurierbare Loeschung von Anfragen ueber einen
  service-role-geschuetzten Cron
- dauerhaften E-Mail-Status und maximal fuenf Retry-Versuche
- die Inquiry-ID als identischen Resend-Idempotency-Key fuer Erst- und
  Folgeversuche

## Wenn du das alte Schema schon einmal ausgefuehrt hast

Falls in deinem bestehenden Projekt noch die alte offene Insert-Policy fuer
`public.inquiries` aktiv ist, fuehre mindestens das hier einmal aus:

```sql
drop policy if exists "Anyone can create inquiries" on public.inquiries;
```

Die Route `/api/inquiries` schreibt danach ueber die Service-Role in die Tabelle.

Fuehre danach die aktuelle `supabase/schema.sql` vollstaendig aus, damit auch
Tabelle, Indexe und RPC fuer das persistente Rate-Limit angelegt werden. Die
RPC ist nur fuer `service_role` freigegeben; `anon` und `authenticated` haben
keinen direkten Zugriff auf die Rate-Limit-Tabelle.

## Empfohlene Vercel-Umgebungsvariablen

```env
NEXT_PUBLIC_SITE_URL=https://deine-domain.tld
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=projects
NEXT_PUBLIC_ENABLE_ADMIN=true
INQUIRY_RATE_LIMIT_SECRET=<zufaelliges-secret>
TRUSTED_PROXY_IP_HEADER=x-vercel-forwarded-for
INQUIRY_RETENTION_DAYS=365
CRON_SECRET=<zufaelliges-cron-secret>
INQUIRY_EMAIL_TIMEOUT_MS=8000
RESEND_API_KEY=<optional>
INQUIRY_EMAIL_TO=<gemeinsam-mit-resend-key>
```

## Admin-Zugriff

Der Zugriff auf `/admin` verwendet direkt Supabase Auth:

1. Anmeldung mit E-Mail und Passwort im Admin-Bereich
2. RLS prueft, ob die User-ID in `public.admin_users` eingetragen ist

Die Kenntnis der URL oder ein normaler Supabase-Account reichen nicht fuer
Datenbank- oder Storage-Zugriff aus.

## Nach dem Eintragen testen

1. `/contact` Formular absenden
2. `/admin` mit deinem Supabase-User anmelden
3. Ein Bild im Admin hochladen
4. Projektseite oeffnen und Bilddarstellung pruefen
5. `sitemap.xml` und `robots.txt` auf der Live-Domain pruefen
6. In den Function-Logs pruefen, dass kein
   `inquiry.rate_limit_fallback` mehr erscheint
7. Bei API-Fehlern den `x-request-id`-Response-Header dem passenden
   strukturierten Log-Eintrag zuordnen
