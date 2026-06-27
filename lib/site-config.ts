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
      "Films and stills for automotive launches, places, and crafted brand moments."
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
    title: `${BRAND_NAME} | Automotive Films & Campaign Stills`,
    description:
      "Lux Studio creates films, stills, and campaign assets for automotive launches, hospitality spaces, and brand moments.",
    ogImage: "/images/demo-car-01.jpg"
  },
  hero: {
    eyebrow: "Films and stills for brands in motion",
    headlineLead: "Lux",
    headlineTrail: "Studio",
    copy: "We create controlled films, launch assets, and still-image systems for cars, spaces, and brand moments that need to feel deliberate from the first frame.",
    videoUrl: "/media/hero-showreel.mp4"
  },
  about: {
    founderNote:
      "The studio was built around a simple idea: strong subjects deserve careful pacing, clean framing, and images that hold attention without shouting for it.",
    positioning:
      "The work sits between production partner and visual editor. Each project is shaped as one visual system across hero film, stills, social fragments, and website surfaces.",
    values: [
      {
        title: "Precision",
        copy: "Every motion decision should feel measured, not improvised."
      },
      {
        title: "Atmosphere",
        copy: "Light, sound, and spacing set the tone before a headline does."
      },
      {
        title: "Clarity",
        copy: "The subject stays legible even when the story becomes more atmospheric."
      }
    ]
  },
  services: [
    {
      number: "01",
      title: "Commercial Shoots",
      description:
        "Campaign films and stills planned around launch windows, opening moments, media plans, and rollout-ready assets.",
      deliverables: ["Hero film", "Edit suite", "Stills", "Cutdowns"]
    },
    {
      number: "02",
      title: "Social Media Content",
      description:
        "Vertical edits, reels, teasers, and short fragments built to stay composed inside fast channels.",
      deliverables: ["Vertical cuts", "Story edits", "Teasers", "Motion crops"]
    },
    {
      number: "03",
      title: "Motion Direction",
      description:
        "Controlled camera movement for cars, spaces, arrivals, and detail-led sequences that keep motion readable.",
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
        "Launch evenings, openings, tastings, private unveilings, and guest moments captured with calm pacing.",
      deliverables: ["Highlights", "Recaps", "Still selects", "Same-day edits"]
    },
    {
      number: "05",
      title: "Brand Campaigns",
      description:
        "Integrated visual systems spanning key visuals, social rollout, landing page content, and motion assets.",
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
        "Films and stills for launches, spaces, and brand moments.",
      ctaButton: "Browse Work"
    },
    services: {
      eyebrow: "What we create",
      headlineLead: "Visual",
      headlineTrail: "Services",
      copy: "Films, stills, and rollout assets for campaigns that need a clear visual line."
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
      copy: "Tell us what you are launching, where it lives, and what the finished assets need to do.",
      directLabel: "Direct contact",
      directCopy:
        "Typical inquiries: launch films, campaign visuals, property content, social cutdowns, guest-experience edits, and event coverage.",
      formLabel: "Project inquiry",
      submitLabel: "Send Inquiry"
    },
    footer: {
      headline:
        "Built for cars, spaces, and private projects that need a clear visual point of view.",
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
