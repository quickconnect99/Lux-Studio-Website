import type { Project, SiteSettings } from "@/lib/types";
import { siteConfig } from "@/lib/site-config";
import { resolveVideoSource } from "@/lib/video";

type OrganizationSettings = Pick<SiteSettings, "brand" | "contact" | "social">;

function absolutePublicUrl(value: string, baseUrl = siteConfig.siteUrl) {
  return new URL(value, `${baseUrl}/`).href;
}

function resolveProfileUrl(value: string) {
  try {
    const url = new URL(value);
    return url.pathname.replaceAll("/", "").trim() ? url.href : null;
  } catch {
    return null;
  }
}

export function buildOrganizationSchema(
  settings: OrganizationSettings,
  baseUrl = siteConfig.siteUrl
) {
  const phone = settings.contact.phone.trim();
  const sameAs = settings.social
    .map((social) => resolveProfileUrl(social.href.trim()))
    .filter((href): href is string => Boolean(href));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brand.name,
    description: settings.brand.strapline,
    url: baseUrl,
    logo: absolutePublicUrl("/images/brand/lux-studio-logo.svg", baseUrl),
    contactPoint: {
      "@type": "ContactPoint",
      email: settings.contact.email,
      ...(phone ? { telephone: phone } : {}),
      contactType: "customer service"
    },
    ...(sameAs.length > 0 ? { sameAs } : {})
  };
}

export function buildPageStructuredData({
  name,
  description,
  path,
  type = "WebPage",
  projects = [],
  baseUrl = siteConfig.siteUrl
}: {
  name: string;
  description: string;
  path: string;
  type?: "AboutPage" | "CollectionPage" | "ContactPage" | "WebPage";
  projects?: Array<Pick<Project, "title" | "slug" | "coverImage">>;
  baseUrl?: string;
}) {
  const pageUrl = absolutePublicUrl(path, baseUrl);
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const itemList =
    projects.length > 0
      ? {
          "@type": "ItemList",
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: project.title,
            url: absolutePublicUrl(`/work/${project.slug}`, baseUrl),
            image: absolutePublicUrl(project.coverImage, baseUrl)
          }))
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        name,
        description,
        url: pageUrl,
        breadcrumb: { "@id": breadcrumbId },
        ...(itemList ? { mainEntity: itemList } : {})
      },
      {
        "@id": breadcrumbId,
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name,
            item: pageUrl
          }
        ]
      }
    ]
  };
}

export function buildProjectBreadcrumbSchema(
  project: Pick<Project, "title" | "slug">,
  baseUrl = siteConfig.siteUrl
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Work",
        item: absolutePublicUrl("/work", baseUrl)
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: absolutePublicUrl(`/work/${project.slug}`, baseUrl)
      }
    ]
  };
}

export function buildProjectVideoSchema(
  project: Pick<
    Project,
    | "title"
    | "shortDescription"
    | "coverImage"
    | "createdAt"
    | "videoUrl"
    | "uploadedVideo"
  >,
  baseUrl = siteConfig.siteUrl
) {
  const videoSource = resolveVideoSource(
    project.uploadedVideo || project.videoUrl
  );

  if (!videoSource) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: project.title,
    description: project.shortDescription,
    thumbnailUrl: absolutePublicUrl(project.coverImage, baseUrl),
    uploadDate: project.createdAt,
    ...(videoSource.kind === "file"
      ? { contentUrl: absolutePublicUrl(videoSource.src, baseUrl) }
      : { embedUrl: videoSource.src })
  };
}
