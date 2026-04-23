import type { AdminProjectFieldKey } from "@/lib/admin-types";

type AdminProjectFieldMeta = {
  label: string;
  helpText: string;
};

export type GalleryFrameRole = {
  label: string;
  description: string;
};

export const adminProjectFieldMeta: Record<
  AdminProjectFieldKey,
  AdminProjectFieldMeta
> = {
  business: {
    label: "Business",
    helpText:
      "Erscheint auf der Projektdetailseite und steuert, in welchem Bereich das Projekt auf der Website einsortiert wird."
  },
  title: {
    label: "Title",
    helpText:
      "Steht als Hauptueberschrift auf der Projektdetailseite und taucht auf Homepage-Karten sowie im Featured-Bereich auf."
  },
  slug: {
    label: "Slug",
    helpText:
      "Bildet die URL unter /work/<slug>. Wird fuer Deep Links, SEO und das Oeffnen der Live-Seite verwendet."
  },
  category: {
    label: "Category",
    helpText:
      "Wird als Projektkategorie auf der Detailseite und in Uebersichten wie Featured Projects angezeigt."
  },
  carModel: {
    label: "Primary Subject",
    helpText:
      "Steht als erstes Meta-Feld auf der Projektdetailseite und in Projektkarten. Bei Hospitality ist das der Venue- oder Property-Name."
  },
  location: {
    label: "Location",
    helpText:
      "Wird in den Meta-Daten der Projektdetailseite und in mehreren Karten/Overlays als Standort gezeigt."
  },
  year: {
    label: "Year",
    helpText:
      "Erscheint im Meta-Grid auf der Projektdetailseite und in Content-Uebersichten als zeitliche Einordnung."
  },
  shortDescription: {
    label: "Short Description",
    helpText:
      "Ist die kurze Einleitung unter dem Projekttitel. Sie wird ausserdem auf Homepage-Karten, Featured Projects und im Next-Project-Block verwendet."
  },
  fullDescription: {
    label: "Full Description",
    helpText:
      "Bildet den Narrative-Abschnitt auf der Projektdetailseite und wird auch im Homepage-Featured-Bereich ausgespielt."
  },
  behindTheScenes: {
    label: "Behind The Scenes",
    helpText:
      "Erscheint als eigener Hintergrund-/Production-Block auf der Projektdetailseite."
  },
  coverImage: {
    label: "Cover Image",
    helpText:
      "Ist das Top-Hauptvisual der Projektdetailseite, dient als Video-Poster und ist die Bildquelle fuer Karten auf der Start- und Work-Seite."
  },
  gallery: {
    label: "Gallery",
    helpText:
      "Die Reihenfolge steuert die Detailseite: Bild 1 wird als grosses Projektbild unter dem Narrative gezeigt, Bild 2+ erscheinen darunter als weitere Stills. Captions bleiben mit dem jeweiligen Bild verknuepft."
  },
  video: {
    label: "Video",
    helpText:
      "Wenn gesetzt, ersetzt das Video das statische Hauptbild auf der Projektdetailseite. Das Cover bleibt als Poster erhalten."
  },
  createdAt: {
    label: "Created At",
    helpText:
      "Steuert die Sortierung im Admin und das Datum fuer strukturierte Video-Daten auf der Live-Seite."
  },
  featured: {
    label: "Featured",
    helpText:
      "Featured-Projekte erscheinen im Featured-Bereich der Homepage."
  },
  published: {
    label: "Published",
    helpText:
      "Nur veroeffentlichte Projekte sind auf der oeffentlichen Website sichtbar und unter /work/<slug> erreichbar."
  }
};

export function getGalleryFrameRole(index: number): GalleryFrameRole {
  if (index === 0) {
    return {
      label: "Large project image",
      description:
        "Appears directly below the narrative section as the main still."
    };
  }

  return {
    label: "Supporting still",
    description: "Appears lower on the project page in the supporting gallery."
  };
}
