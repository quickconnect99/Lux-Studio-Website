# Supabase Production Setup

Diese Website erwartet fuer den Live-Betrieb die folgenden Supabase-Werte:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` falls der Bucket nicht `projects` heisst

Fuer die zusaetzliche Admin-Schutzschicht werden ausserdem empfohlen:

- `ADMIN_GATE_USER`
- `ADMIN_GATE_PASSWORD`
- `ADMIN_GATE_SECRET`

## Was du im Supabase-Dashboard holen musst

1. `Project URL`
2. `anon public key`
3. `service_role secret key`
4. Region des Projekts fuer Impressum / Datenschutz
5. Einen Admin-User in Auth:
   Dazu brauchst du nur E-Mail + Passwort, damit du dich unter `/admin` anmelden kannst.

## Was du in Supabase anlegen musst

1. SQL aus `supabase/schema.sql` ausfuehren
2. Public Storage Bucket `projects` anlegen
3. Im Bucket die Dateien in diese Pfade hochladen lassen:
   `covers/`, `gallery/`, `videos/`

## Wichtiger Unterschied zum alten Setup

Kontaktanfragen laufen jetzt ueber den Server-Endpoint `/api/inquiries`.
Dafuer wird `SUPABASE_SERVICE_ROLE_KEY` auf dem Server benoetigt.

Der Vorteil:

- kein direkter Browser-Insert mehr in `inquiries`
- einfache Bot-Bremse vor dem Datenbank-Write
- einfachere spaetere Erweiterung fuer Turnstile / Mailversand / Webhooks

## Wenn du das alte Schema schon einmal ausgefuehrt hast

Falls in deinem bestehenden Projekt noch die alte offene Insert-Policy fuer
`public.inquiries` aktiv ist, fuehre mindestens das hier einmal aus:

```sql
drop policy if exists "Anyone can create inquiries" on public.inquiries;
```

Die Route `/api/inquiries` schreibt danach ueber die Service-Role in die Tabelle.

## Empfohlene Vercel-Umgebungsvariablen

```env
NEXT_PUBLIC_SITE_URL=https://deine-domain.tld
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=projects
NEXT_PUBLIC_ENABLE_ADMIN=true
ADMIN_GATE_USER=<separater-admin-gate-user>
ADMIN_GATE_PASSWORD=<langes-zufalls-passwort>
ADMIN_GATE_SECRET=<weiteres-langes-zufalls-secret>
```

## Admin-Schutzschicht

Der Zugriff auf `/admin` ist jetzt in Production zweistufig:

1. interne Admin-Gate-Login-Seite mit signiertem Session-Cookie
2. danach Supabase-Login im eigentlichen Admin-Bereich

Damit ist die Route nicht mehr offen sichtbar nutzbar, selbst wenn jemand die
URL kennt.

## Nach dem Eintragen testen

1. `/contact` Formular absenden
2. `/admin` mit deinem Supabase-User anmelden
3. Ein Bild im Admin hochladen
4. Projektseite oeffnen und Bilddarstellung pruefen
5. `sitemap.xml` und `robots.txt` auf der Live-Domain pruefen
