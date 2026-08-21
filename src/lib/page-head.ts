// Shared per-route <head> builder. Keeps titles/descriptions in French and
// points every social card at the site logo card served from /public.
const SITE = "https://newhopeorphanage.org";
export const OG_IMAGE = `${SITE}/og-card.jpg`;

export interface PageHeadInput {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  /** ISO 639-1 language code for hreflang alternate links. */
  lang?: "en" | "fr";
}

export function pageHead({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  lang = "fr",
}: PageHeadInput) {
  const url = `${SITE}${path}`;
  // The other language version uses the same path (client-side language toggle).
  const alternateLang = lang === "fr" ? "en" : "fr";

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: ogTitle ?? title },
      { property: "og:description", content: ogDescription ?? description },
      { property: "og:type", content: ogType },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:locale", content: lang === "fr" ? "fr_FR" : "en_US" },
      { property: "og:locale:alternate", content: lang === "fr" ? "en_US" : "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle ?? title },
      { name: "twitter:description", content: ogDescription ?? description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: lang, href: url },
      { rel: "alternate", hrefLang: alternateLang, href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
  };
}

// ---------------------------------------------------------------------------
// Structured data (JSON-LD) helpers
// ---------------------------------------------------------------------------

export const SITE_NAME = "New Hope Orphanage";
export const SITE_URL = SITE;

/** Organization schema – rendered once in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/nho-logo.webp`,
    description:
      "New Hope Orphanage provides shelter, education, healthcare, and nutrition to orphaned children in Yaoundé and Douala, Cameroon.",
    foundingDate: "2018",
    email: "newhopeorphanahe@gmail.com",
    telephone: "+237-676-516-652",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CM",
      addressRegion: "Centre / Littoral",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Yaoundé",
        containedInPlace: {
          "@type": "Country",
          name: "Cameroon",
        },
      },
      {
        "@type": "City",
        name: "Douala",
        containedInPlace: {
          "@type": "Country",
          name: "Cameroon",
        },
      },
    ],
    sameAs: [],
  };
}

/** WebSite schema with SearchAction – rendered once in the root layout. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}
