import type { SiteSettings } from "@/lib/types";

export const LEGAL_PLACEHOLDER = "Please complete";
const legacyLegalPlaceholders = [LEGAL_PLACEHOLDER, "Bitte ergaenzen"];

export const legalProfile = {
  legalForm: "GmbH",
  representative: "Reuteler Benjamin, Nico Hagelberger",
  streetAddress: "Speckibuent 2",
  postalCode: "9494",
  city: "Schaan",
  country: "Liechtenstein",
  companyPurpose:
    "Photo, film, and social media productions for brand, automotive, and campaign projects.",
  registerCourt: "",
  registerNumber: "",
  vatId: "",
  supervisoryAuthority: "",
  chamberOrProfessionalAssociation: "",
  professionalTitle: "",
  mediaOwner: "Lux Studio GmbH",
  editorialResponsibility: "Reuteler Benjamin, Nico Hagelberger",
  editorialLine:
    "Presentation of the company, its services, and published reference and project work.",
  hostingProviderName: "Vercel Inc.",
  hostingProviderLocation: "EU (Frankfurt, Germany)",
  databaseProviderName: "Supabase",
  databaseProviderLocation: "EU (Ireland)",
  privacyContactEmail: "n.hagelberger@luxstudio.li"
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
  return (
    normalized.length > 0 &&
    !legacyLegalPlaceholders.some((placeholder) =>
      normalized.startsWith(placeholder.toLowerCase())
    )
  );
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
    { label: "Company name", value: settings.brand.name },
    { label: "Legal form", value: legalProfile.legalForm },
    { label: "Authorized representative", value: legalProfile.representative },
    { label: "Street and number", value: legalProfile.streetAddress },
    { label: "Postal code", value: legalProfile.postalCode },
    { label: "City", value: legalProfile.city },
    { label: "Country", value: legalProfile.country },
    { label: "Media owner", value: legalProfile.mediaOwner },
    {
      label: "Editorially responsible",
      value: legalProfile.editorialResponsibility
    }
  ];

  return fields.filter((field) => isMissingLegalValue(field.value));
}

export function getMissingPrivacyFields() {
  const fields: LegalFieldDescriptor[] = [
    { label: "Hosting provider", value: legalProfile.hostingProviderName },
    { label: "Hosting location", value: legalProfile.hostingProviderLocation },
    {
      label: "Database location",
      value: legalProfile.databaseProviderLocation
    }
  ];

  return fields.filter((field) => isMissingLegalValue(field.value));
}
