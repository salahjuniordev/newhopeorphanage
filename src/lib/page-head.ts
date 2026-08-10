// Shared per-route <head> builder. Keeps titles/descriptions in French and
// points every social card at the site logo card served from /public.
const SITE = "https://newhopeorphanage.lovable.app";
export const OG_IMAGE = `${SITE}/og-card.jpg`;

export interface PageHeadInput {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
}

export function pageHead({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
}: PageHeadInput) {
  const url = `${SITE}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: ogTitle ?? title },
      { property: "og:description", content: ogDescription ?? description },
      { property: "og:type", content: ogType },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle ?? title },
      { name: "twitter:description", content: ogDescription ?? description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
