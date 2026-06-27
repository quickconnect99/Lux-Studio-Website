import {
  Camera,
  Clapperboard,
  Film,
  MapPin,
  Smartphone,
  Video
} from "lucide-react";
import type { ComponentType } from "react";
import type { Project, Service } from "@/lib/types";

export const services: Service[] = [
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
      "Vertical edits, reels, teasers, and short fragments built to stay composed inside fast channels.",
    deliverables: ["Vertical cuts", "Story edits", "Teasers", "Motion crops"]
  },
  {
    number: "03",
    title: "Motion Direction",
    description:
      "Controlled camera movement for cars, spaces, arrivals, and detail-led sequences that keep motion readable.",
    deliverables: ["Shot design", "Tracking footage", "Sound design", "Grades"]
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
];

export const projects: Project[] = [
  {
    business: "Car",
    title: "Midnight Aeroline",
    slug: "midnight-aeroline",
    shortDescription:
      "A nocturnal city film pairing sharp body lines with quiet, deliberate motion.",
    fullDescription:
      "Shot between tunnel light, wet asphalt, and reflective storefronts, Midnight Aeroline gives a grand touring coupe a quieter city presence. The cut balances restrained pacing with short pulses of acceleration for launch pages, social cutdowns, and paid media.",
    category: "Brand Film",
    carModel: "Chevrolet Camaro RS",
    location: "Zurich",
    year: 2025,
    coverImage: "/images/car-pictures/midnight-aeroline-03.jpg",
    galleryImages: [
      "/images/car-pictures/midnight-aeroline-03.jpg",
      "/images/car-pictures/midnight-aeroline-02.avif"
    ],
    galleryCaptions: [
      "Lead still for the Camaro-based campaign, used to anchor the opener with a lower stance and more grounded street posture.",
      "Supporting frame used to push a hotter contrast note through the same rollout while keeping the coupe silhouette instantly readable."
    ],
    videoUrl: "/media/hero-showreel.mp4",
    featured: true,
    published: true,
    createdAt: "2025-11-04T09:00:00.000Z",
    behindTheScenes:
      "Low-profile rigging, reflective traffic control, and practical sodium light were used to avoid a synthetic studio sheen."
  },
  {
    business: "Car",
    title: "Alpine Vector",
    slug: "alpine-vector",
    shortDescription:
      "Launch content shaped around cold air, long roads, and a pared-back alpine palette.",
    fullDescription:
      "Created for a winter release cycle, Alpine Vector uses negative space and high-altitude roads to make the vehicle feel precise rather than aggressive. The campaign included a launch hero film, stills for dealer assets, and short social edits with a stripped, directional rhythm.",
    category: "Launch Campaign",
    carModel: "BMW M4 Competition",
    location: "St. Moritz",
    year: 2026,
    coverImage: "/images/car-pictures/alpine-vector-01.avif",
    galleryImages: [
      "/images/car-pictures/alpine-vector-01.avif",
      "/images/car-pictures/alpine-vector-02.avif",
      "/images/car-pictures/alpine-vector-03.avif"
    ],
    galleryCaptions: [
      "Primary BMW M4 still with enough negative space for launch copy, dealer overlays, and press crops.",
      "Performance-led support frame that keeps the M4 language sharper and more aggressive for rollout fragments and social crops.",
      "Third supporting still used to broaden the campaign with another M4 angle while holding the colder launch palette together."
    ],
    videoUrl: "/media/project-reel.mp4",
    featured: true,
    published: true,
    createdAt: "2026-01-12T11:00:00.000Z",
    behindTheScenes:
      "The production ran on a split-unit schedule to capture first light roads, overcast bodywork, and clean wheel detail without heavy composite work."
  },
  {
    business: "Car",
    title: "Current Form",
    slug: "current-form",
    shortDescription:
      "A clean electric campaign language built for silent performance and social rollout.",
    fullDescription:
      "Current Form explored the visual tension between stillness and torque. The deliverables centered on a modular campaign system: a homepage hero loop, portrait-first social edits, and a bank of stills for CRM, outdoor, and launch deck use.",
    category: "Social Content",
    carModel: "Porsche Taycan Turbo S",
    location: "Milan",
    year: 2025,
    coverImage: "/images/demo-car-03.jpg",
    galleryImages: [
      "/images/demo-car-03.jpg",
      "/images/project-03.svg",
      "/images/frame-03.svg"
    ],
    galleryCaptions: [
      "Clean electric hero frame with reduced background noise so the silhouette reads instantly across digital placements.",
      "Project board for the Porsche Taycan Turbo S, used to align quieter electric branding with social-first copy, pacing, and portrait-safe crops.",
      "Selected frame layout from the same campaign system, preserving the Taycan rollout language across reels, stories, and paid placements."
    ],
    videoUrl: "/media/project-reel.mp4",
    featured: true,
    published: true,
    createdAt: "2025-08-21T13:15:00.000Z",
    behindTheScenes:
      "The electric sound bed was built from layered charge tones, tyre texture, and HVAC tonal detail to keep the film tactile without resorting to synthetic FX."
  },
  {
    business: "Car",
    title: "Desert Circuit",
    slug: "desert-circuit",
    shortDescription:
      "Rolling footage and stills captured during a private desert preview route.",
    fullDescription:
      "Desert Circuit focused on warm reflections, road texture, and motion continuity across a private event route. Deliverables included event coverage, same-day social reels, and still selects for guest recap material.",
    category: "Event Coverage",
    carModel: "Ferrari Roma Spider",
    location: "Abu Dhabi",
    year: 2024,
    coverImage: "/images/car-pictures/desert-circuit-01.jpg",
    galleryImages: ["/images/car-pictures/desert-circuit-01.jpg"],
    galleryCaptions: [
      "Ferrari Roma Spider still carrying the warmer route mood and clean event-led bodywork detail in a single frame."
    ],
    videoUrl: "/media/project-reel.mp4",
    featured: false,
    published: true,
    createdAt: "2024-05-19T08:45:00.000Z",
    behindTheScenes:
      "A reduced crew footprint allowed the team to move between convoy positions without turning the route into a visible production convoy."
  },
  {
    business: "Car",
    title: "Velocity Notes",
    slug: "velocity-notes",
    shortDescription:
      "A rolling-shot study shaped to make road speed feel measured, clean, and readable.",
    fullDescription:
      "Velocity Notes distilled a road-performance story into a set of flexible assets, using camera height, longer lenses, and restrained cut patterns to keep the car grounded. The final system was used across launch decks, showroom screens, and paid media.",
    category: "Rolling Shots",
    carModel: "Aston Martin Vantage",
    location: "Dolomites",
    year: 2026,
    coverImage: "/images/car-pictures/velocity-notes-01.webp",
    galleryImages: ["/images/car-pictures/velocity-notes-01.webp"],
    galleryCaptions: [
      "Aston Martin Vantage support still focused on stance, road posture, and a cleaner rolling-shot read for campaign placements."
    ],
    videoUrl: "/media/project-reel.mp4",
    featured: false,
    published: true,
    createdAt: "2026-02-03T07:20:00.000Z",
    behindTheScenes:
      "Shot planning prioritized corner exit lines and repeatable rhythm, so the sequence could support both short cutdowns and static site storytelling."
  },
  {
    business: "Hospitality",
    title: "Quiet Arrival",
    slug: "quiet-arrival",
    shortDescription:
      "A hospitality launch story shaped around arrival, material warmth, and calm pacing.",
    fullDescription:
      "Quiet Arrival was developed for a high-alpine property relaunch that needed to feel intimate instead of promotional. The campaign balanced interior stills, guest-facing motion loops, and a hero edit for booking pages, social rollout, and press previews.",
    category: "Brand Film",
    carModel: "7132 Hotel Vals",
    location: "Vals",
    year: 2026,
    coverImage: "/images/hospitality/quiet-arrival-cover.svg",
    galleryImages: ["/images/hospitality/quiet-arrival-frame.svg"],
    galleryCaptions: [
      "Hospitality hero frame built around light spill, stone textures, and a slower arrival rhythm for booking-first placements."
    ],
    videoUrl: "/media/project-reel.mp4",
    featured: false,
    published: true,
    createdAt: "2026-03-18T10:30:00.000Z",
    behindTheScenes:
      "Camera movement was reduced to short glides and locked compositions so the property could feel spacious, quiet, and materially precise."
  },
  {
    business: "Hospitality",
    title: "Lakeside Ritual",
    slug: "lakeside-ritual",
    shortDescription:
      "Launch content for a boutique hospitality concept built around dining, texture, and evening mood.",
    fullDescription:
      "Lakeside Ritual translated a new guest experience into a modular launch system: a short brand film, stills for the booking flow, and social edits that held onto the same warm, architectural language across every touchpoint.",
    category: "Launch Campaign",
    carModel: "Hofmeister Collection",
    location: "Lake Zurich",
    year: 2026,
    coverImage: "/images/hospitality/lakeside-ritual-cover.svg",
    galleryImages: ["/images/hospitality/lakeside-ritual-frame.svg"],
    galleryCaptions: [
      "Support still focused on terrace light, table rhythm, and hospitality framing that works across web and print crops."
    ],
    videoUrl: "/media/project-reel.mp4",
    featured: false,
    published: true,
    createdAt: "2026-02-26T16:15:00.000Z",
    behindTheScenes:
      "The lighting plan used existing practicals and a restrained fill package to preserve the real mood of the space instead of restaging it into a generic luxury look."
  }
];

/**
 * Maps service number → Lucide icon component.
 * Co-located with the services array so icon assignments stay in sync
 * with service data instead of being scattered across page files.
 */
export const serviceIcons: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  "01": Film,
  "02": Smartphone,
  "03": Video,
  "04": Camera,
  "05": Clapperboard,
  "06": MapPin
};
