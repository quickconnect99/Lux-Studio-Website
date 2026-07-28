import type { NavigationVisibility, SiteSettings } from "@/lib/types";

export const BRAND_NAME = "Lux Studio";
export const BRAND_MARK = "L/S";
export const DEFAULT_PROJECT_IMAGE = "/images/demo-car-01.jpg";

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
  updatedAt: "2026-07-28T00:00:00.000Z",
  brand: {
    name: BRAND_NAME,
    mark: BRAND_MARK,
    strapline:
      "Films and photography for car launches, dealer campaigns, and events."
  },
  social: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/"
    }
  ],
  contact: {
    email: "n.hagelberger@luxstudio.li",
    phone: "",
    city: "Zurich / Milan / Monaco"
  },
  seo: {
    title: `${BRAND_NAME} | Automotive Films & Campaign Stills`,
    description:
      "Lux Studio produces films and photography for car launches, dealer campaigns, and events."
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
    teamMembers: [
      {
        name: "Nico Hagelberger",
        title: "Creative Partner",
        position: "Production & Client Direction",
        description:
          "Nico shapes the project brief, keeps communication clear, and translates campaign goals into shoot priorities, deliverables, and rollout-ready assets.",
        image: "/images/demo-car-02.jpg"
      },
      {
        name: "Benjamin Reuteler",
        title: "Creative Partner",
        position: "Film & Visual Direction",
        description:
          "Benjamin leads framing, pacing, and visual consistency on set, making sure each film and still set carries the same controlled studio language.",
        image: "/images/demo-car-03.jpg"
      }
    ],
    teamGallery: ["/images/demo-car-02.jpg", "/images/demo-car-03.jpg"],
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
  motionFrames: [
    "/images/car-pictures/midnight-aeroline-03.jpg",
    "/images/car-pictures/midnight-aeroline-02.avif",
    "/images/car-pictures/alpine-vector-01.avif",
    "/images/car-pictures/alpine-vector-02.avif",
    "/images/car-pictures/alpine-vector-03.avif",
    "/images/demo-car-03.jpg",
    "/images/project-03.svg",
    "/images/frame-03.svg",
    "/images/car-pictures/desert-circuit-01.jpg",
    "/images/car-pictures/velocity-notes-01.webp"
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
      mediaNotice: "Third-party media loads only after click"
    }
  }
};

export const siteConfig = {
  ...defaultSiteSettings,
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  navigation
};
