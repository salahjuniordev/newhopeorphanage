import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import navCss from "../components/site-navbar.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteNavbar } from "../components/SiteNavbar";
import { BottomNav } from "../components/BottomNav";
import { SiteFooter } from "../components/SiteFooter";
import { I18nProvider } from "../lib/i18n";
import {
  organizationSchema,
  websiteSchema,
} from "../lib/page-head";

const LEGACY_CSS = [
  "/legacy/css/bootstrap.min.css",
  "/legacy/css/slicknav.min.css",
  "/legacy/css/swiper-bundle.min.css",
  "/legacy/css/magnific-popup.css",
  "/legacy/css/custom.css",
];

// Trimmed to essentials — the removed libraries (gsap/wow/parallax/magic cursor
// /SmoothScroll/isotope/YTPlayer/counterup) were only used for niche animations
// on the legacy home page and were adding ~1.5MB of blocking JS to every route.
const LEGACY_JS = [
  "/legacy/js/jquery-3.7.1.min.js",
  "/legacy/js/bootstrap.min.js",
  "/legacy/js/jquery.slicknav.js",
  "/legacy/js/swiper-bundle.min.js",
  "/legacy/js/jquery.magnific-popup.min.js",
];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, maximum-scale=1",
      },
      { title: "New Hope Orphanage — Supporting Children in Cameroon" },
      { name: "description", content: "New Hope Orphanage provides care, education, and support to children in Yaoundé and Douala, Cameroon. Donate, volunteer, or partner with us." },
      { name: "author", content: "New Hope Orphanage" },
      { property: "og:site_name", content: "New Hope Orphanage" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { name: "google-site-verification", content: "ndgewlMN02w4aQLdOi3YKONQ_wgRKkudWACZym4TmKc" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/nho-logo.png" },
      { rel: "apple-touch-icon", href: "/nho-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Onest:wght@100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
      },
      ...LEGACY_CSS.map((href) => ({ rel: "stylesheet", href })),
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: navCss },
    ],
    scripts: [
      ...LEGACY_JS.map((src) => ({ src, defer: true })),
      // Organization & WebSite structured data
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationSchema()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteSchema()),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <SiteNavbar />
        <Outlet />
        <SiteFooter />
        <BottomNav />
      </I18nProvider>
    </QueryClientProvider>
  );
}
