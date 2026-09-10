import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 text-center">
      <div className="max-w-md">
        <p className="eyebrow text-gold">404 Error</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          Page not found
        </h1>
        <div className="gold-rule mx-auto my-6 w-20" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          The piece or showroom page you are looking for does not exist or has been relocated.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/explore"
            className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background hover:bg-foreground/90 transition-colors"
          >
            Explore Catalogue
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-border px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-foreground hover:border-gold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 text-center">
      <div className="max-w-md">
        <p className="eyebrow text-gold">Notice</p>
        <h1 className="mt-3 font-display text-3xl text-foreground md:text-4xl">
          Unable to display this page
        </h1>
        <div className="gold-rule mx-auto my-6 w-20" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Something unexpected occurred while loading this section. Please try refreshing or return to the main catalogue.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background hover:bg-foreground/90 transition-colors"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-border px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-foreground hover:border-gold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Maleka Furnitures — Moghalpura, Hyderabad" },
      {
        name: "description",
        content:
          "Maleka Furnitures, Moghalpura, Hyderabad. Sofas, beds, dining sets, wedding furniture and storage.",
      },
      { name: "author", content: "Maleka Furnitures" },
      { property: "og:title", content: "Maleka Furnitures — Hyderabad" },
      {
        property: "og:description",
        content:
          "A trusted furniture showroom in Moghalpura, Hyderabad. Browse the collection and enquire directly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", href: "/favicon-32x32.png", sizes: "32x32" },
      { rel: "icon", type: "image/png", href: "/favicon-16x16.png", sizes: "16x16" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
