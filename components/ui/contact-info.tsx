import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

type ContactInfoProps = {
  contact: SiteSettings["contact"];
  /** Show Mail / Phone / MapPin icons next to each value. Default: false. */
  showIcons?: boolean;
};

/**
 * Renders the contact block (email link, phone, city) from SiteSettings.
 *
 * Used in:
 * - `app/contact/page.tsx` — with icons inside the direct-contact panel
 * - `components/layout/site-footer.tsx` — without icons in the connect column
 *
 * All three fields are optional; the component renders nothing for empty strings.
 */
export function ContactInfo({ contact, showIcons = false }: ContactInfoProps) {
  return (
    <div className="space-y-3 text-sm text-muted">
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-3 leading-7 transition-colors duration-150 hover:text-foreground"
        >
          {showIcons && <Mail className="h-4 w-4 shrink-0 text-accent" />}
          {contact.email}
        </a>
      )}
      {contact.phone && (
        <p className="flex items-center gap-3 leading-7">
          {showIcons && <Phone className="h-4 w-4 shrink-0 text-accent" />}
          {contact.phone}
        </p>
      )}
      {contact.city && (
        <p className="flex items-center gap-3 leading-7">
          {showIcons && <MapPin className="h-4 w-4 shrink-0 text-accent" />}
          {contact.city}
        </p>
      )}
    </div>
  );
}
