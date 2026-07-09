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
      "Films and photography for car launches, dealer campaigns, and events."
  },
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Vimeo", href: "https://vimeo.com" }
  ],
  contact: {
    email: "nico.hagelberger@lux-studios.net",
    phone: "+41 00 000 00 00",
    city: "Zurich / Milan / Monaco"
  },
  seo: {
    title: `${BRAND_NAME} | Automotive Films & Campaign Stills`,
    description:
      "Lux Studio produces films and photography for car launches, dealer campaigns, and events.",
    ogImage: "/images/demo-car-01.jpg"
  },
  hero: {
    eyebrow: "Automotive film & photography studio",
    headlineLead: "Lux",
    headlineTrail: "Studio",
    copy: "We shoot launch films and stills for car brands and dealerships, built to hold up on a billboard, a product page, or a 15-second cut.",
    videoUrl: "/media/hero-showreel.mp4"
  },
  about: {
    founderNote:
      "The studio was built around a simple idea: strong subjects deserve careful pacing, clean framing, and images that hold attention without shouting for it.",
    positioning:
      "We work as an extension of your marketing team: one shoot, cut down into a hero film, stills, and social content that all look like they belong together.",
    values: [
      {
        title: "Precision",
        copy: "Every shot is planned before the camera rolls, not improvised on set."
      },
      {
        title: "Atmosphere",
        copy: "Good lighting and sound design carry a brand further than another headline."
      },
      {
        title: "Clarity",
        copy: "Whatever mood we build, the car stays the clear focus of the frame."
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
      title: "Event Coverage",
      description:
        "Launch evenings, openings, tastings, private unveilings, and guest moments captured with calm pacing.",
      deliverables: ["Highlights", "Recaps", "Still selects", "Same-day edits"]
    },
    {
      number: "04",
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
  selectedFrames: [
    "/images/demo-car-02.jpg",
    "/images/demo-car-03.jpg",
    "/images/demo-car-04.jpg",
    "/images/demo-car-05.jpg"
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
      brandHeadlineLead: "Shot",
      brandHeadlineTrail: "To Sell",
      servicesEyebrow: "Services snapshot",
      servicesHeadlineLead: "Built",
      servicesHeadlineTrail: "For Campaigns",
      ctaEyebrow: "Next Project",
      ctaHeadlineLead: "Ready",
      ctaHeadlineTrail: "To Launch",
      ctaCopy:
        "Tell us about your next launch, campaign, or event and we'll shape the shoot around it.",
      ctaButton: "Browse Work"
    },
    work: {
      eyebrow: "Portfolio",
      headlineLead: "Selected",
      headlineTrail: "Projects",
      copy: "Films, stills, and campaign work from recent car launches and dealer projects."
    },
    services: {
      eyebrow: "What we create",
      headlineLead: "Visual",
      headlineTrail: "Services",
      copy: "Photography and film production for car brands, from single shoots to full campaign rollouts."
    },
    about: {
      eyebrow: "Studio profile",
      headlineLead: "Who We",
      headlineTrail: "Are",
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
        "Film and photography for car brands, dealerships, and private commissions.",
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
