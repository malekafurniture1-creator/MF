import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone, Star } from "lucide-react";

import { storefront } from "@/lib/local-assets";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import {
  BUSINESS,
  mapsEmbedUrl,
  mapsUrl,
  telUrl,
  whatsappUrl,
} from "@/lib/business";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit Maleka Furnitures — Moghalpura, Hyderabad" },
      {
        name: "description",
        content:
          "Find Maleka Furnitures at Sultan Shahi Road, Moghalpura, Hyderabad. Directions, phone number and WhatsApp enquiries.",
      },
      { property: "og:url", content: "https://malekafurnitures.com/visit" },
      { property: "og:title", content: "Visit Maleka Furnitures in Hyderabad" },
      {
        property: "og:description",
        content:
          "Directions and contact details for Maleka Furnitures in Moghalpura, Hyderabad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "script:ld+json",
        content: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FurnitureStore",
          name: "Maleka Furnitures",
          url: "https://malekafurnitures.com",
          telephone: "+919391033589",
          address: {
            "@type": "PostalAddress",
            streetAddress: "18-7-198/A/3, Murad Mahal, Sultan Shahi Road",
            addressLocality: "Moghalpura",
            addressRegion: "Hyderabad",
            addressCountry: "IN",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "3.7",
            reviewCount: "147",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "09:00",
              closes: "22:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Sunday"],
              opens: "09:00",
              closes: "18:00",
            },
          ],
          priceRange: "₹₹",
        }),
      },
    ],
  }),
  component: Visit,
});

function Visit() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative h-[46vh] min-h-[320px] overflow-hidden">
        <img
          src={storefront}
            alt="Maleka Furnitures showroom"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 md:px-8">
          <p className="eyebrow text-ink-foreground/70">Find us</p>
          <h1 className="mt-3 font-display text-4xl text-ink-foreground md:text-6xl">
            Moghalpura, Hyderabad
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
        <div>
          <h2 className="font-display text-3xl">Showroom details</h2>
          <div className="gold-rule mt-5 w-32" />

          <ul className="mt-8 space-y-6 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <div>
                <p className="eyebrow">Address</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-muted-foreground hover:text-foreground"
                >
                  {BUSINESS.address}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <div>
                <p className="eyebrow">Phone</p>
                <a
                  href={telUrl}
                  className="mt-1 block text-muted-foreground hover:text-foreground"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
              <div>
                <p className="eyebrow">Opening hours</p>
                <p className="mt-1 text-muted-foreground">
                  {BUSINESS.hours}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Star className="mt-0.5 size-4 shrink-0 fill-gold text-gold" />
              <div>
                <p className="eyebrow">Customer rating</p>
                <p className="mt-1 text-muted-foreground">
                  {BUSINESS.rating} out of 5
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-background"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp us
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] hover:border-foreground"
            >
              Open in Maps
            </a>
          </div>
        </div>

        <div className="min-h-[420px] overflow-hidden bg-muted">
          <iframe
            title="Map to Maleka Furnitures, Moghalpura"
            src={mapsEmbedUrl}
            loading="lazy"
            className="h-full min-h-[420px] w-full border-0"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
