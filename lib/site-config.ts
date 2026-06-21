import type { NavigationVisibility, SiteSettings } from "@/lib/types";

export const BRAND_NAME = "Lux Studio";
export const BRAND_MARK = "L/S";

const fallbackSiteUrl = "http://localhost:3000";

function normalizeSiteUrl(value?: string) {
  const siteUrl = value?.trim() || fallbackSiteUrl;
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

const baseNavigation = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "services", label: "Services", href: "/services" },
  { key: "about", label: "About", href: "/about" },
  { key: "contact", label: "Contact", href: "/contact" }
] as const;

const adminNavigation = { label: "Admin", href: "/admin" } as const;

export const isPublicAdminEnabled =
  process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true";

export const navigation = isPublicAdminEnabled
  ? [...baseNavigation, adminNavigation]
  : [...baseNavigation];

export function getVisibleNavigation(visibility: NavigationVisibility) {
  return navigation.filter((item) => !("key" in item) || visibility[item.key]);
}

export const defaultSiteSettings: SiteSettings = {
  brand: {
    name: BRAND_NAME,
    mark: BRAND_MARK,
    strapline:
      "Cinematic campaign visuals for automotive and hospitality brands."
  },
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Vimeo", href: "https://vimeo.com" }
  ],
  contact: {
    email: "hello@northlinemotion.studio",
    phone: "+41 00 000 00 00",
    city: "Zurich / Milan / Monaco"
  },
  seo: {
    title: `${BRAND_NAME} | Premium Automotive & Hospitality Campaigns`,
    description:
      "Premium campaign studio for automotive and hospitality films, stills, launches, and editorial brand storytelling.",
    ogImage: "/images/demo-car-01.jpg"
  },
  hero: {
    eyebrow: "Editorial motion for brands and places",
    headlineLead: "Lux",
    headlineTrail: "Studio",
    copy: "A boutique studio creating cinematic campaign films, launch content, and premium still systems for automotive brands, hotels, and hospitality spaces that want atmosphere to feel designed.",
    videoUrl: "/media/hero-showreel.mp4"
  },
  about: {
    founderNote:
      "The studio was built around a simple idea: premium products and premium spaces deserve the same visual discipline as fashion, design, and architecture campaigns. The approach favors control, pacing, and atmosphere over noise.",
    positioning:
      "The work sits between production partner and visual editor. That means developing a coherent language across hero film, stills, social fragments, and website surfaces instead of treating each deliverable as a separate style.",
    values: [
      {
        title: "Precision",
        copy: "Every motion decision should feel measured, not improvised."
      },
      {
        title: "Atmosphere",
        copy: "Light, sound, and spacing build premium emotion before copy does."
      },
      {
        title: "Clarity",
        copy: "The subject stays legible even when the storytelling becomes cinematic."
      }
    ]
  },
  services: [
    {
      number: "01",
      title: "Commercial Shoots",
      description:
        "Full-scale campaign films and stills built around launch windows, opening moments, media plans, and rollout-ready assets.",
      deliverables: ["Hero film", "Edit suite", "Stills", "Cutdowns"]
    },
    {
      number: "02",
      title: "Social Media Content",
      description:
        "Vertical edits, reels, teasers, and editorial fragments designed to stay premium inside fast channels.",
      deliverables: ["Vertical cuts", "Story edits", "Teasers", "Motion crops"]
    },
    {
      number: "03",
      title: "Motion Direction",
      description:
        "Controlled camera movement for cars, spaces, arrivals, and atmosphere-led sequences that keep motion elegant and readable.",
      deliverables: [
        "Shot design",
        "Tracking footage",
        "Sound design",
        "Grades"
      ]
    },
    {
      number: "04",
      title: "Event Coverage",
      description:
        "Launch evenings, openings, tastings, private unveilings, and guest moments captured with editorial pacing instead of recap energy.",
      deliverables: ["Highlights", "Recaps", "Still selects", "Same-day edits"]
    },
    {
      number: "05",
      title: "Brand Campaigns",
      description:
        "Integrated visual systems spanning key visuals, social rollout, landing page content, and premium motion assets.",
      deliverables: [
        "Campaign system",
        "Look development",
        "Master edit",
        "Localization"
      ]
    }
  ],
  navigation: {
    home: true,
    work: true,
    services: true,
    about: true,
    contact: true
  },
  copy: {
    home: {
      selectedWorkLabel: "Selected work",
      heroPrimaryCta: "View Portfolio",
      heroSecondaryCta: "Start An Inquiry",
      videoHeadlineLead: "Built",
      videoHeadlineTrail: "To Be Seen",
      brandEyebrow: "Brand statement",
      brandHeadlineLead: "Cinematic",
      brandHeadlineTrail: "Visual Stories",
      servicesEyebrow: "Services snapshot",
      servicesHeadlineLead: "Built",
      servicesHeadlineTrail: "For Campaigns",
      ctaEyebrow: "Next Project",
      ctaHeadlineLead: "Ready",
      ctaHeadlineTrail: "To Launch",
      ctaCopy:
        "Cinematic campaign visuals for automotive and hospitality brands.",
      ctaButton: "Browse Work"
    },
    services: {
      eyebrow: "What we create",
      headlineLead: "Visual",
      headlineTrail: "Services",
      copy: "Cinematic campaign visuals for automotive and hospitality brands."
    },
    about: {
      eyebrow: "Studio profile",
      headlineLead: "Story",
      headlineTrail: "And Intent",
      founderLabel: "Founder note",
      positioningLabel: "Positioning"
    },
    contact: {
      eyebrow: "Start a project",
      headlineLead: "Let's",
      headlineTrail: "Talk Motion",
      copy: "A concise inquiry flow for campaign films, stills, launches, properties, and premium brand content.",
      directLabel: "Direct contact",
      directCopy:
        "Typical inquiries: launch films, campaign visuals, property content, social cutdowns, guest-experience edits, and premium event coverage.",
      formLabel: "Project inquiry",
      submitLabel: "Send Inquiry"
    },
    footer: {
      headline:
        "Built for brands and spaces that want to feel seen before they are explained.",
      navigationLabel: "Navigation",
      connectLabel: "Connect",
      mediaNotice: "Externe Medien laden erst nach Klick"
    }
  }
};

export const siteConfig = {
  ...defaultSiteSettings,
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  navigation
};
