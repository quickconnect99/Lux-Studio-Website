import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import {
  getFormattedBusinessAddress,
  getMissingImprintFields,
  getPublicLegalIdentity,
  isMissingLegalValue,
  legalProfile
} from "@/lib/legal";
import { getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Kontakt- und Anbieterangaben fuer die Website sowie Hinweise zum Medieninhalt."
};

function DetailRow({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-2 border-t border-line py-4 sm:grid-cols-[220px_1fr] sm:items-start">
      <dt className="text-xs uppercase tracking-eyebrow text-muted">{label}</dt>
      <dd className="text-sm leading-7 text-foreground">{value}</dd>
    </div>
  );
}

export default async function ImprintPage() {
  const settings = await getSiteSettings();
  const identity = getPublicLegalIdentity(settings);
  const missingFields = getMissingImprintFields(settings);
  const businessAddress = getFormattedBusinessAddress();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        lead="Impress"
        trail="um"
        copy="Zentrale Anbieter- und Kontaktangaben fuer diese Website. Vor dem Livegang bitte alle Platzhalter mit den echten Unternehmensdaten ersetzen."
      />

      <section className="section-shell pb-14">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <div className="panel-2xl p-6 sm:p-7">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Status
              </p>
              {missingFields.length > 0 ? (
                <>
                  <p className="mt-4 text-sm leading-7 text-foreground">
                    Dieses Impressum enthaelt noch Platzhalter. Vor dem
                    Livegang bitte mindestens diese Angaben vervollstaendigen:
                  </p>
                  <ul className="mt-4 grid gap-3">
                    {missingFields.map((field) => (
                      <li
                        key={field.label}
                        className="rounded-[1.25rem] border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6 text-foreground"
                      >
                        {field.label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm leading-7 text-muted">
                  Keine offensichtlichen Platzhalter mehr gefunden.
                </p>
              )}
            </div>

            <div className="panel-2xl p-6 sm:p-7">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Hinweis
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Die Seite ist als DACH-/EU-freundliche Vorlage aufgebaut. Wenn
                dein Unternehmenssitz ausserhalb der EU liegt oder besondere
                Berufsregeln gelten, muessen die Angaben entsprechend angepasst
                werden.
              </p>
            </div>
          </aside>

          <div className="panel-2xl p-6 sm:p-8">
            <h2 className="font-[family:var(--font-display)] text-3xl uppercase leading-none text-foreground sm:text-4xl">
              Anbieterangaben
            </h2>

            <dl className="mt-6">
              <DetailRow label="Unternehmensname" value={identity.operatorName} />
              <DetailRow label="Rechtsform" value={legalProfile.legalForm} />
              <DetailRow
                label="Vertreten durch"
                value={legalProfile.representative}
              />
              <DetailRow label="Anschrift" value={businessAddress} />
              <DetailRow label="E-Mail" value={identity.email} />
              <DetailRow label="Telefon" value={identity.phone} />
              <DetailRow
                label="Unternehmensgegenstand"
                value={legalProfile.companyPurpose}
              />
              <DetailRow label="Registergericht" value={legalProfile.registerCourt} />
              <DetailRow
                label="Registernummer"
                value={legalProfile.registerNumber}
              />
              <DetailRow label="Umsatzsteuer-ID" value={legalProfile.vatId} />
              <DetailRow
                label="Aufsichtsbehoerde"
                value={legalProfile.supervisoryAuthority}
              />
              <DetailRow
                label="Kammer / Berufsverband"
                value={legalProfile.chamberOrProfessionalAssociation}
              />
              <DetailRow
                label="Berufsbezeichnung"
                value={legalProfile.professionalTitle}
              />
            </dl>

            <div className="mt-8 rounded-[1.5rem] border border-line bg-panel-secondary p-5">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Medieninhalt
              </p>
              <dl className="mt-4">
                <DetailRow label="Medieninhaber" value={legalProfile.mediaOwner} />
                <DetailRow
                  label="Redaktionell verantwortlich"
                  value={legalProfile.editorialResponsibility}
                />
                <DetailRow
                  label="Grundlegende Ausrichtung"
                  value={legalProfile.editorialLine}
                />
              </dl>
            </div>

            {!isMissingLegalValue(legalProfile.privacyContactEmail) && (
              <p className="mt-6 text-sm leading-7 text-muted">
                Datenschutz-Anfragen koennen direkt an{" "}
                <a
                  href={`mailto:${legalProfile.privacyContactEmail}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {legalProfile.privacyContactEmail}
                </a>{" "}
                gerichtet werden.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
