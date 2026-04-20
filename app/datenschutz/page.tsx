import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/sections/page-header";
import {
  getFormattedBusinessAddress,
  getMissingPrivacyFields,
  getPublicLegalIdentity,
  isMissingLegalValue,
  legalProfile
} from "@/lib/legal";
import { getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Hinweise zur Verarbeitung personenbezogener Daten, Kontaktanfragen und externen Videoeinbettungen."
};

function PrivacyBlock({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-line bg-panel-secondary p-6 shadow-card sm:p-7">
      <h2 className="font-[family:var(--font-display)] text-3xl uppercase leading-none text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
        {children}
      </div>
    </section>
  );
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const identity = getPublicLegalIdentity(settings);
  const missingFields = getMissingPrivacyFields();
  const businessAddress = getFormattedBusinessAddress();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        lead="Daten"
        trail="schutz"
        copy="Diese Seite dokumentiert die aktuell im Projekt sichtbaren Datenfluesse: Kontaktformular, Theme-Speicherung im Browser und externe Video-Embeds erst nach Nutzeraktion."
      />

      <section className="section-shell pb-14">
        <div className="grid gap-6">
          {missingFields.length > 0 && (
            <div className="panel-2xl border border-warning/30 bg-warning/10 p-6 sm:p-7">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Vor Livegang noch pruefen
              </p>
              <p className="mt-4 text-sm leading-7 text-foreground">
                Diese Datenschutzerklaerung enthaelt noch Platzhalter fuer
                Infrastrukturangaben. Bitte ergaenze vor dem Deployment:
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {missingFields.map((field) => (
                  <li
                    key={field.label}
                    className="rounded-[1.25rem] border border-warning/30 bg-white/35 px-4 py-3 text-sm leading-6 text-foreground"
                  >
                    {field.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PrivacyBlock title="1. Verantwortlicher">
            <p>
              Verantwortlich fuer die Datenverarbeitung auf dieser Website ist{" "}
              <strong className="text-foreground">{identity.operatorName}</strong>.
            </p>
            <p>
              Kontakt:{" "}
              <a
                href={`mailto:${identity.email}`}
                className="text-foreground underline underline-offset-4"
              >
                {identity.email}
              </a>
              {identity.phone ? `, ${identity.phone}` : ""}
              {businessAddress ? `, ${businessAddress}` : ""}.
            </p>
            {!isMissingLegalValue(legalProfile.privacyContactEmail) && (
              <p>
                Datenschutzanfragen koennen ausserdem an{" "}
                <a
                  href={`mailto:${legalProfile.privacyContactEmail}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {legalProfile.privacyContactEmail}
                </a>{" "}
                gerichtet werden.
              </p>
            )}
            <p>
              Weitere Anbieterangaben findest du im{" "}
              <Link
                href="/impressum"
                className="text-foreground underline underline-offset-4"
              >
                Impressum
              </Link>
              .
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="2. Hosting und technische Bereitstellung">
            <p>
              Beim Aufruf der Website verarbeitet der jeweilige Hosting-Provider
              technisch notwendige Verbindungsdaten, etwa IP-Adresse,
              Zeitstempel, Request-Informationen, Browserdaten und
              Server-Logs, um die Website auszuliefern und die Systemsicherheit
              zu gewaehrleisten.
            </p>
            <p>
              Eingeplanter Hosting-Provider:{" "}
              <strong className="text-foreground">
                {legalProfile.hostingProviderName}
              </strong>
              {isMissingLegalValue(legalProfile.hostingProviderLocation)
                ? "."
                : `, Standort: ${legalProfile.hostingProviderLocation}.`}
            </p>
            <p>
              Rechtsgrundlage ist das berechtigte Interesse an einem sicheren
              und stabilen Websitebetrieb.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="3. Kontaktformular">
            <p>
              Bei einer Projektanfrage werden die im Formular eingegebenen Daten
              verarbeitet: Name, E-Mail-Adresse, Firma, gewaehlter Service-Typ
              und Projektbriefing.
            </p>
            <p>
              Zweck ist die Bearbeitung der Anfrage sowie die Vorbereitung einer
              moeglichen Zusammenarbeit. Rechtsgrundlage ist die Durchfuehrung
              vorvertraglicher Massnahmen bzw. unser berechtigtes Interesse an
              der strukturierten Bearbeitung von Projektanfragen.
            </p>
            <p>
              Sofern in der Live-Umgebung aktiviert, werden Formulareintraege in{" "}
              <strong className="text-foreground">
                {legalProfile.databaseProviderName}
              </strong>{" "}
              gespeichert
              {isMissingLegalValue(legalProfile.databaseProviderLocation)
                ? "."
                : `, Standort: ${legalProfile.databaseProviderLocation}.`}
            </p>
            <p>
              Die Daten werden nur so lange gespeichert, wie dies fuer die
              Bearbeitung der Anfrage, anschliessende Kommunikation oder
              gesetzliche Nachweis- und Aufbewahrungspflichten erforderlich ist.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="4. Externe Videoeinbettungen">
            <p>
              Projekte koennen Videos von Drittanbietern wie YouTube oder Vimeo
              enthalten. Diese Inhalte werden nicht automatisch geladen.
            </p>
            <p>
              Erst wenn du in der Video-Vorschau aktiv auf{" "}
              <strong className="text-foreground">Video laden</strong> klickst,
              wird eine Verbindung zum jeweiligen Anbieter hergestellt. Dabei
              koennen insbesondere IP-Adresse, Browserinformationen und weitere
              technische Nutzungsdaten an den Anbieter uebermittelt werden.
            </p>
            <p>
              Rechtsgrundlage fuer das Nachladen des externen Inhalts ist deine
              ausdrueckliche Handlung direkt am jeweiligen Video. Ohne Klick
              findet kein externer Abruf des eingebetteten Videos statt.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="5. Lokale Speicherung im Browser">
            <p>
              Diese Website speichert lokal im Browser die vom Nutzer aktiv
              gewaehlte Darstellungsvariante des Themes. Dabei wird ein
              Eintrag unter dem Schluessel <code>theme</code> im
              Browser-Speicher abgelegt.
            </p>
            <p>
              Der Eintrag dient ausschliesslich dazu, die gewuenschte
              Oberflaechenvariante beim naechsten Seitenaufruf wiederherzustellen.
              Es erfolgt keine Reichweitenmessung und kein Marketing-Tracking.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="6. Externe Links und Social Media">
            <p>
              Auf der Website sind Links zu externen Plattformen und sozialen
              Netzwerken eingebunden. Beim blossen Anzeigen der Seite werden
              diese Plattformen nicht automatisch geladen. Erst beim Klick auf
              einen solchen Link verlaesst du diese Website.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="7. Deine Rechte">
            <p>
              Dir stehen nach anwendbarem Datenschutzrecht insbesondere Rechte
              auf Auskunft, Berichtigung, Loeschung, Einschraenkung der
              Verarbeitung, Datenuebertragbarkeit und Widerspruch zu.
            </p>
            <p>
              Wenn du Fragen zur Verarbeitung deiner Daten hast, schreibe an{" "}
              <a
                href={`mailto:${identity.email}`}
                className="text-foreground underline underline-offset-4"
              >
                {identity.email}
              </a>
              .
            </p>
          </PrivacyBlock>
        </div>
      </section>
    </>
  );
}
