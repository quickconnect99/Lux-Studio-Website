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
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

const pageTitle = "Privacy Policy";
const pageDescription =
  "Information about personal data processing, project inquiries, and third-party video embeds.";

export async function generateMetadata(): Promise<Metadata> {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);
  const image = resolveSharingImage({
    preferredImages: settings.selectedFrames,
    projects,
    settings
  });

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: "/datenschutz"
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

function PrivacyBlock({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-line bg-panel-secondary p-6 shadow-card sm:p-7">
      <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase leading-none text-foreground sm:text-4xl">
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
        lead="Privacy"
        trail="Policy"
        copy="This page documents the data flows currently visible in the project: the project inquiry form, browser theme storage, and third-party video embeds loaded only after user interaction."
      />

      <section className="section-shell pb-14">
        <div className="grid gap-6">
          {missingFields.length > 0 && (
            <div className="panel-2xl border border-warning/30 bg-warning/10 p-6 sm:p-7">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Check Before Launch
              </p>
              <p className="mt-4 text-sm leading-7 text-foreground">
                This privacy policy still contains placeholders for
                infrastructure details. Please complete the following before
                deployment:
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

          <PrivacyBlock title="1. Controller">
            <p>
              The controller responsible for data processing on this website
              is{" "}
              <strong className="text-foreground">{identity.operatorName}</strong>.
            </p>
            <p>
              Contact:{" "}
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
                Privacy requests can also be sent to{" "}
                <a
                  href={`mailto:${legalProfile.privacyContactEmail}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {legalProfile.privacyContactEmail}
                </a>.
              </p>
            )}
            <p>
              Further provider information is available in the{" "}
              <Link
                href="/impressum"
                className="text-foreground underline underline-offset-4"
              >
                Legal Notice
              </Link>
              .
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="2. Hosting and Technical Delivery">
            <p>
              When you visit the website, the hosting provider processes
              technically necessary connection data such as IP address,
              timestamps, request details, browser information, and server logs
              to deliver the website and maintain system security.
            </p>
            <p>
              Planned hosting provider:{" "}
              <strong className="text-foreground">
                {legalProfile.hostingProviderName}
              </strong>
              {isMissingLegalValue(legalProfile.hostingProviderLocation)
                ? "."
                : `, location: ${legalProfile.hostingProviderLocation}.`}
            </p>
            <p>
              The legal basis is our legitimate interest in a secure and stable
              website operation.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="3. Project Inquiry Form">
            <p>
              When you submit a project inquiry, we process the data entered in
              the form: name, email address, company, selected service type,
              and project brief.
            </p>
            <p>
              The purpose is to review your request and prepare for a possible
              collaboration. The legal basis is the performance of
              pre-contractual steps or our legitimate interest in handling
              project inquiries in a structured way.
            </p>
            <p>
              If enabled in the live environment, form submissions are stored
              in{" "}
              <strong className="text-foreground">
                {legalProfile.databaseProviderName}
              </strong>{" "}
              {isMissingLegalValue(legalProfile.databaseProviderLocation)
                ? "."
                : `, location: ${legalProfile.databaseProviderLocation}.`}
            </p>
            <p>
              The data is stored only as long as necessary to process the
              inquiry, continue related communication, or meet legal retention
              and documentation obligations.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="4. Third-Party Video Embeds">
            <p>
              Projects may include videos from third-party providers such as
              YouTube or Vimeo. These contents are not loaded automatically.
            </p>
            <p>
              Only when you actively click{" "}
              <strong className="text-foreground">Load video</strong> in the
              video preview is a connection made to the provider. This may
              transmit data such as your IP address, browser information, and
              other technical usage data to that provider.
            </p>
            <p>
              The legal basis for loading the external content is your explicit
              action on the respective video. Without that click, no external
              request for the embedded video is made.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="5. Local Browser Storage">
            <p>
              This website stores the user-selected theme variant locally in
              the browser. An entry under the key <code>theme</code> is written
              to browser storage.
            </p>
            <p>
              This entry is used solely to restore the preferred interface
              variant on the next visit. No analytics measurement or marketing
              tracking is performed.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="6. External Links and Social Media">
            <p>
              The website contains links to external platforms and social
              networks. Simply viewing the page does not automatically load
              those platforms. Only when you click such a link do you leave
              this website.
            </p>
          </PrivacyBlock>

          <PrivacyBlock title="7. Your Rights">
            <p>
              Under applicable data protection law, you may have rights of
              access, rectification, erasure, restriction of processing, data
              portability, and objection.
            </p>
            <p>
              If you have questions about the processing of your data, contact{" "}
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
