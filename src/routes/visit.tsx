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
      { title: "Visit the Showroom — HI LINE COMFORTS, Telangana" },
      {
        name: "description",
        content:
          "Find HI LINE COMFORTS at Secundrabad, Telangana. Directions, phone number and WhatsApp enquiries for our furniture showroom.",
      },
      { property: "og:title", content: "Visit HI LINE COMFORTS in Telangana" },
      {
        property: "og:description",
        content:
          "Directions and contact details for the HI LINE COMFORTS showroom in Secundrabad, Telangana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
          alt="HI LINE COMFORTS showroom frontage at dusk"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 md:px-8">
          <p className="eyebrow text-ink-foreground/70">Find us</p>
          <h1 className="mt-3 font-display text-4xl text-ink-foreground md:text-6xl">
            Secundrabad, Telangana
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
                <p className="eyebrow">Best time to visit</p>
                <p className="mt-1 text-muted-foreground">
                  Call ahead and we'll keep the pieces you're interested in
                  ready to view.
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
            title="Map to HI LINE COMFORTS, Secundrabad"
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
