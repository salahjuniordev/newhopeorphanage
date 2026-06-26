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
import { reportLovableError } from "../lib/lovable-error-reporting";

const LEGACY_CSS = [
  "/legacy/css/bootstrap.min.css",
  "/legacy/css/slicknav.min.css",
  "/legacy/css/swiper-bundle.min.css",
  "/legacy/css/animate.css",
  "/legacy/css/magnific-popup.css",
  "/legacy/css/mousecursor.css",
  "/legacy/css/custom.css",
];

const LEGACY_JS = [
  "/legacy/js/jquery-3.7.1.min.js",
  "/legacy/js/bootstrap.min.js",
  "/legacy/js/validator.min.js",
  "/legacy/js/jquery.slicknav.js",
  "/legacy/js/swiper-bundle.min.js",
  "/legacy/js/jquery.waypoints.min.js",
  "/legacy/js/jquery.counterup.min.js",
  "/legacy/js/isotope.min.js",
  "/legacy/js/jquery.magnific-popup.min.js",
  "/legacy/js/SmoothScroll.js",
  "/legacy/js/parallaxie.js",
  "/legacy/js/gsap.min.js",
  "/legacy/js/magiccursor.js",
  "/legacy/js/SplitText.js",
  "/legacy/js/ScrollTrigger.min.js",
  "/legacy/js/wow.min.js",
  "/legacy/js/function.js",
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
      { title: "New Hope Orphanage" },
      { name: "description", content: "New Hope Orphanage" },
      { name: "author", content: "Awaiken" },
    ],
    links: [
      { rel: "shortcut icon", type: "image/x-icon", href: "/legacy/images/favicon.png" },
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
    ],
    scripts: LEGACY_JS.map((src) => ({ src, defer: true })),
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
      <Outlet />
    </QueryClientProvider>
  );
}
