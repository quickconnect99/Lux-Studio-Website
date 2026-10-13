import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import {
  getFormattedBusinessAddress,
  getPublicLegalIdentity,
  isMissingLegalValue,
  legalProfile
} from "@/lib/legal";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { getSiteSettings } from "@/lib/supabase";

const pageTitle = "Legal Notice";
const pageDescription =
  "Company, contact, and media ownership details for this website.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = resolveSharingImage({
    preferredImages: settings.selectedFrames,
    settings
  });

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: "/impressum"
    },
    ...buildSharingMetadata({
      title: `${pageTitle} | ${settings.brand.name}`,
      description: pageDescription,
      image,
      imageAlt: `${settings.brand.name} featured still`,
      siteName: settings.brand.name
    })
  };
}

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
  const businessAddress = getFormattedBusinessAddress();
  const companyName = [identity.operatorName, legalProfile.legalForm]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        lead="Legal"
        trail="Notice"
        copy="Company, contact, and media ownership details for Lux Studio."
      />

      <section className="section-shell pb-14">
        <div className="mx-auto max-w-5xl">
          <div className="panel-2xl p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase leading-none text-foreground sm:text-4xl">
              Company Details
            </h2>

            <dl className="mt-6">
              <DetailRow label="Company Name" value={companyName} />
              <DetailRow
                label="Represented By"
                value={legalProfile.representative}
              />
              <DetailRow label="Address" value={businessAddress} />
              <DetailRow label="Email" value={identity.email} />
              <DetailRow label="Phone" value={identity.phone} />
              <DetailRow
                label="Business Purpose"
                value={legalProfile.companyPurpose}
              />
              <DetailRow
                label="Register Court"
                value={legalProfile.registerCourt}
              />
              <DetailRow
                label="Registration Number"
                value={legalProfile.registerNumber}
              />
              <DetailRow label="VAT ID" value={legalProfile.vatId} />
              <DetailRow
                label="Supervisory Authority"
                value={legalProfile.supervisoryAuthority}
              />
              <DetailRow
                label="Chamber / Professional Association"
                value={legalProfile.chamberOrProfessionalAssociation}
              />
              <DetailRow
                label="Professional Title"
                value={legalProfile.professionalTitle}
              />
            </dl>

            <div className="mt-8 rounded-[1.5rem] border border-line bg-panel-secondary p-5">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Media Ownership
              </p>
              <dl className="mt-4">
                <DetailRow
                  label="Media Owner"
                  value={legalProfile.mediaOwner}
                />
                <DetailRow
                  label="Editorially Responsible"
                  value={legalProfile.editorialResponsibility}
                />
                <DetailRow
                  label="Editorial Line"
                  value={legalProfile.editorialLine}
                />
              </dl>
            </div>

            {!isMissingLegalValue(legalProfile.privacyContactEmail) && (
              <p className="mt-6 text-sm leading-7 text-muted">
                Privacy requests can be sent directly to{" "}
                <a
                  href={`mailto:${legalProfile.privacyContactEmail}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {legalProfile.privacyContactEmail}
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
