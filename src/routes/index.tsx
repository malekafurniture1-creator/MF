import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { useEffect, useRef } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { FurnitureSilhouette } from "@/components/site/FurnitureSilhouette";
import { FloatingOfferButton, OfferSection } from "@/components/site/OfferSection";
import { WeddingSection } from "@/components/site/WeddingSection";
import { BUSINESS, mapsUrl, telUrl, whatsappUrl } from "@/lib/business";
import {
  designerBed,
  diningSet,
  dressingWardrobe,
  rockingChair,
  sectionalSofa as sofa,
  showcaseCabinet,
  storefront,
  heroDesktopWebm,
  heroDesktopMp4,
  heroMobileMp4,
  heroPoster,
} from "@/lib/local-assets";
import { CATEGORIES } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maleka Furnitures — Furniture Showroom in Moghalpura, Hyderabad" },
      {
        name: "description",
        content:
          "Maleka Furnitures in Moghalpura, Hyderabad. Sofas, beds, dining sets, wedding packages and storage furniture. Established 2003.",
      },
      { property: "og:url", content: "https://malekafurnitures.com/" },
      { property: "og:title", content: "Maleka Furnitures — Hyderabad" },
      {
        property: "og:description",
        content:
          "A trusted Moghalpura furniture showroom. Browse the collection and enquire directly.",
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
  component: Home,
});

function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).connection?.saveData) {
      videoRef.current?.pause();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <video
  autoPlay
  muted
  loop
  playsInline
  poster={heroPoster}
  aria-label="MALEKA FURNITURES"
  className="h-full w-full object-cover object-[60%_center] md:object-center"
  ref={videoRef}
>
  {/* Mobile MP4 */}
  <source src={heroMobileMp4} type="video/mp4" media="(max-width: 767px)" />
  {/* Desktop WebM (primary) */}
  <source src={heroDesktopWebm} type="video/webm" />
  {/* Desktop MP4 fallback */}
  <source src={heroDesktopMp4} type="video/mp4" />
</video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-ink/5" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
              <p className="eyebrow text-ink-foreground/70">
                Hyderabad · Telangana
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[2.7rem] leading-[1.05] text-ink-foreground sm:text-6xl md:text-7xl">
                Furniture worth
                <span className="block italic text-gold">making room for.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-foreground/75">
                A working showroom, not a catalogue. Come see the grain, the
                stitch and the finish before you decide.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 bg-gold px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Explore collection
                  <ArrowRight className="size-3.5" />
                </Link>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-ink-foreground/40 px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-ink-foreground transition-colors hover:bg-ink-foreground hover:text-ink"
                >
                  <MessageCircle className="size-3.5" />
                  Enquire now
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-foreground/60">
                <span className="flex items-center gap-1.5 text-gold">
                  <Star className="size-3.5 fill-current" /> {BUSINESS.rating} rating
                </span>
                <span>Custom sizes & finishes</span>
                <span>{BUSINESS.reviewCount} Google reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OfferSection />

      {/* Category selector */}
      <section className="border-b border-border/70 bg-sand/60">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl">Shop by piece</h2>
            <Link
              to="/explore"
              className="hidden text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:block"
            >
              View all
            </Link>
          </div>
          <div className="no-scrollbar -mx-5 mt-7 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to="/explore"
                search={{ category }}
                className="group flex w-[7.5rem] shrink-0 flex-col items-center gap-3 border border-border/70 bg-background px-3 py-6 transition-all hover:-translate-y-1 hover:border-gold hover:shadow-soft"
              >
                <FurnitureSilhouette
                  name={category}
                  className="h-10 w-14 text-foreground/70 transition-colors group-hover:text-gold"
                />
                <span className="text-center text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground group-hover:text-foreground">
                  {category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial featured collection */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-xl">
          <p className="eyebrow">Featured this season</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Pieces currently on the floor
          </h2>
          <div className="gold-rule mt-6 w-40" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:h-[690px] md:grid-cols-[minmax(0,1fr)_minmax(0,0.995fr)_minmax(0,0.995fr)_minmax(0,0.75fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-3 lg:h-[760px] lg:gap-4">
          <FeaturedFrame
            name="L-Shaped Sectional Sofa"
            category="Sofas"
            image={sofa}
            className="order-1 col-span-2 aspect-[16/10] md:order-none md:col-span-3 md:col-start-2 md:row-start-1 md:aspect-auto"
            imageClassName="object-cover object-center"
            priority
          />
          <FeaturedFrame
            name="Wardrobe"
            category="Commercial"
            image={showcaseCabinet}
            className="order-2 aspect-[3/4] md:order-none md:col-span-1 md:col-start-1 md:row-span-2 md:row-start-1 md:aspect-auto"
            imageClassName="object-cover object-center"
            bookend
          />
          <FeaturedFrame
            name="Rocking Chair"
            category="Seating"
            image={rockingChair}
            className="order-3 aspect-[3/4] md:order-none md:col-span-1 md:col-start-5 md:row-span-2 md:row-start-1 md:aspect-auto"
            imageClassName="object-cover object-center"
            bookend
          />
          <FeaturedFrame
            name="Designer King Bed"
            category="Beds"
            image={designerBed}
            className="order-4 aspect-[4/3] md:order-none md:col-span-1 md:col-start-2 md:row-start-2 md:aspect-auto"
            imageClassName="object-cover object-center"
          />
          <FeaturedFrame
            name="Dining Set"
            category="Dining"
            image={diningSet}
            className="order-5 aspect-[4/3] md:order-none md:col-span-1 md:col-start-3 md:row-start-2 md:aspect-auto md:h-[calc(100%+1.25rem)]"
            imageClassName="object-cover object-center"
          />
          <FeaturedFrame
            name="Mirrored Dressing Table"
            category="Wardrobes"
            image={dressingWardrobe}
            className="order-6 col-span-2 aspect-[16/11] md:order-none md:col-span-1 md:col-start-4 md:row-start-2 md:aspect-auto md:h-[92%]"
            imageClassName="object-cover object-center"
          />
        </div>

        <div className="mt-14">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 border-b border-foreground pb-1 text-[0.72rem] uppercase tracking-[0.22em]"
          >
            See the full catalogue
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      <WeddingSection />

      {/* Showroom strip */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="overflow-hidden">
            <img
              src={storefront}
              alt="Sectional sofa with ottoman displayed at MALEKA FURNITURES"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-ink-foreground/50">Why the showroom</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
              Seen in person, chosen with certainty
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-foreground/70">
              Everything on this site sits on our floor in Hyderabad. Sit
              on the sofa, open the wardrobe, check the marble. Tell us the size
              and finish you need and we'll make it work for your room.
            </p>
            <dl className="mt-9 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <dt className="eyebrow text-ink-foreground/50">Rating</dt>
                <dd className="mt-2 font-display text-3xl text-gold">
                  {BUSINESS.rating}★
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-foreground/50">Made to order</dt>
                <dd className="mt-2 font-display text-3xl">Custom sizes</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 border border-border/70 p-8 md:grid-cols-2 md:p-14">
          <div>
            <p className="eyebrow">Visit us</p>
            <h2 className="mt-3 font-display text-4xl leading-tight">
              Come by the showroom
            </h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {BUSINESS.address}
            </a>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={telUrl}
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-background"
              >
                <Phone className="size-3.5" />
                {BUSINESS.phoneDisplay}
              </a>
              <Link
                to="/visit"
                className="inline-flex items-center gap-2 border border-border px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] hover:border-foreground"
              >
                Get Directions
              </Link>
            </div>
          </div>
          <div className="min-h-[260px] overflow-hidden bg-muted">
            <iframe
              title="Maleka Furnitures location map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                `${BUSINESS.name}, ${BUSINESS.address}`,
              )}&t=k&z=18&output=embed`}
              loading="lazy"
              className="h-full min-h-[260px] w-full border-0"
            />
          </div>
        </div>
      </section>

      <Footer />
      <FloatingOfferButton />
    </div>
  );
}

type FeaturedFrameProps = {
  name: string;
  category: string;
  image: string;
  className: string;
  imageClassName: string;
  bookend?: boolean;
  priority?: boolean;
};

function FeaturedFrame({
  name,
  category,
  image,
  className,
  imageClassName,
  bookend = false,
  priority = false,
}: FeaturedFrameProps) {
  return (
    <Link
      to="/explore"
      search={{ category }}
      aria-label={`Explore ${category}`}
      className={`group relative overflow-hidden border border-[#e4dac7] bg-[#f8f3e8] p-2 shadow-[0_8px_20px_rgba(54,43,24,0.12)] transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:rotate-[0.7deg] hover:shadow-[0_16px_32px_rgba(54,43,24,0.2)] ${bookend ? "md:shadow-[0_12px_28px_rgba(54,43,24,0.17)]" : ""} ${className}`}
    >
      <img
        src={image}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full ${imageClassName}`}
      />
      <div className="absolute inset-x-2 bottom-2 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-4 pb-4 pt-12 text-white transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <p className="text-[0.58rem] uppercase tracking-[0.22em] text-white/75">{category}</p>
        <h3 className="mt-1 font-display text-lg leading-tight sm:text-xl">{name}</h3>
      </div>
    </Link>
  );
}
