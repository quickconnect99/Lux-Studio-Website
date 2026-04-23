import type { SiteSettings } from "@/lib/types";

export const LEGAL_PLACEHOLDER = "Bitte ergaenzen";

export const legalProfile = {
  legalForm: LEGAL_PLACEHOLDER,
  representative: LEGAL_PLACEHOLDER,
  streetAddress: LEGAL_PLACEHOLDER,
  postalCode: LEGAL_PLACEHOLDER,
  city: LEGAL_PLACEHOLDER,
  country: LEGAL_PLACEHOLDER,
  companyPurpose:
    "Foto-, Film- und Social-Media-Produktionen für Marken, Automotive- und Hospitality-Projekte.",
  registerCourt: "",
  registerNumber: "",
  vatId: "",
  supervisoryAuthority: "",
  chamberOrProfessionalAssociation: "",
  professionalTitle: "",
  mediaOwner: LEGAL_PLACEHOLDER,
  editorialResponsibility: LEGAL_PLACEHOLDER,
  editorialLine:
    "Vorstellung des Unternehmens, seiner Dienstleistungen sowie veröffentlichter Referenz- und Projektarbeiten.",
  hostingProviderName: "Vercel Inc.",
  hostingProviderLocation: "EU (Frankfurt, Deutschland)",
  databaseProviderName: "Supabase",
  databaseProviderLocation: "EU (Irland)",
  privacyContactEmail: ""
} as const;

type LegalFieldDescriptor = {
  label: string;
  value: string | undefined;
};

function hasMeaningfulValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && !normalized.startsWith("bitte ergaenzen");
}

export function isMissingLegalValue(value: string | undefined) {
  return !hasMeaningfulValue(value);
}

export function getPublicLegalIdentity(settings: SiteSettings) {
  return {
    operatorName: settings.brand.name,
    email: settings.contact.email,
    phone: settings.contact.phone
  };
}

export function getFormattedBusinessAddress() {
  const parts = [
    legalProfile.streetAddress,
    [legalProfile.postalCode, legalProfile.city].filter(Boolean).join(" "),
    legalProfile.country
  ];

  return parts.filter(hasMeaningfulValue).join(", ");
}

export function getMissingImprintFields(settings: SiteSettings) {
  const fields: LegalFieldDescriptor[] = [
    { label: "Unternehmensname", value: settings.brand.name },
    { label: "Rechtsform", value: legalProfile.legalForm },
    { label: "Vertretungsberechtigte Person", value: legalProfile.representative },
    { label: "Strasse und Hausnummer", value: legalProfile.streetAddress },
    { label: "PLZ", value: legalProfile.postalCode },
    { label: "Ort", value: legalProfile.city },
    { label: "Land", value: legalProfile.country },
    { label: "Medieninhaber", value: legalProfile.mediaOwner },
    {
      label: "Redaktionell verantwortlich",
      value: legalProfile.editorialResponsibility
    }
  ];

  return fields.filter((field) => isMissingLegalValue(field.value));
}

export function getMissingPrivacyFields() {
  const fields: LegalFieldDescriptor[] = [
    { label: "Hosting-Provider", value: legalProfile.hostingProviderName },
    { label: "Hosting-Standort", value: legalProfile.hostingProviderLocation },
    {
      label: "Datenbank-Standort",
      value: legalProfile.databaseProviderLocation
    }
  ];

  return fields.filter((field) => isMissingLegalValue(field.value));
}
