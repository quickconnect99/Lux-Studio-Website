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
6. Die UUID dieses Users in `public.admin_users` eintragen:

```sql
insert into public.admin_users (user_id)
values ('<auth-user-uuid>')
on conflict (user_id) do nothing;
```

Ein Auth-User ohne Eintrag in `public.admin_users` kann sich authentifizieren,
aber keine Projekte, Anfragen, Site Settings oder Storage-Dateien verwalten.

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
speichert dort nur einen SHA-256-Hash aus Client-Merkmalen, niemals die rohe
IP-Adresse oder den User-Agent.

Solange diese Migration in einem bestehenden Projekt noch nicht angewendet
wurde, verwendet die Route automatisch das lokale In-Memory-Limit. Dieser
Fallback verhindert einen Ausfall, schuetzt aber nicht instanzuebergreifend.
Im Server-Log erscheint dann hoechstens einmal in fuenf Minuten das
strukturierte Event `inquiry.rate_limit_fallback`.

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
