import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import offerBadge from "@/assets/offer.webp";

import { fetchActiveOffers, offerEnquiryUrl } from "@/lib/offers";
import { cn } from "@/lib/utils";

function formatPrice(val: string | null | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("₹") ? trimmed : `₹${trimmed}`;
}

export function OfferSection() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["active-offers"],
    queryFn: fetchActiveOffers,
  });

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-rotate every 3 seconds for 2+ offers
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % offers.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [offers.length, isPaused]);

  const safeIndex = offers.length > 0 ? index % offers.length : 0;
  const offer = offers[safeIndex];

  if (isLoading || offers.length === 0 || !offer) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (offers.length <= 1 || touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diffX = touchStartX.current - touch.clientX;
    const diffY = touchStartY.current - touch.clientY;

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        setIndex((prev) => (prev + 1) % offers.length);
      } else {
        setIndex((prev) => (prev - 1 + offers.length) % offers.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const formattedOriginalPrice = formatPrice(offer.original_price);
  const formattedOfferPrice = formatPrice(offer.offer_price);

  return (
    <section id="offers" className="border-b border-border bg-sand/50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-5 flex items-center justify-between">
          <p className="eyebrow">Featured offer</p>
          {offers.length > 1 ? (
            <div className="flex items-center gap-1.5">
              {offers.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to offer ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === safeIndex ? "w-6 bg-gold" : "w-1.5 bg-border hover:bg-muted-foreground"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <article
          className="grid overflow-hidden border border-border bg-background transition-opacity duration-500 md:grid-cols-2 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative aspect-[16/10] h-full w-full overflow-hidden md:aspect-auto">
            <img
              key={offer.id}
              src={offer.image_url}
              alt={offer.headline}
              className="h-full w-full object-cover transition-opacity duration-500"
            />
          </div>

          <div className="flex flex-col justify-center p-7 md:p-12">
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              {offer.headline}
            </h2>

            {offer.supporting_text ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                {offer.supporting_text}
              </p>
            ) : null}

            {formattedOriginalPrice || formattedOfferPrice ? (
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                {formattedOriginalPrice ? (
                  <span className="text-base text-muted-foreground line-through decoration-muted-foreground/60">
                    {formattedOriginalPrice}
                  </span>
                ) : null}
                {formattedOfferPrice ? (
                  <span className="font-display text-3xl font-semibold text-gold">
                    {formattedOfferPrice}
                  </span>
                ) : null}
              </div>
            ) : null}

            <a
              href={offerEnquiryUrl(offer.headline)}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-fit items-center gap-2 bg-foreground px-5 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-85"
            >
              <MessageCircle className="size-3.5" />
              {offer.cta_label || "Enquire about this offer"}
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

export function FloatingOfferButton() {
  const { data: offers = [] } = useQuery({
    queryKey: ["active-offers"],
    queryFn: fetchActiveOffers,
  });
  if (!offers.length) return null;
  return (
    <a
      href="#offers"
      className="fixed bottom-20 right-5 z-40 flex flex-col items-center gap-1 opacity-90 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-100"
    >
      <img
        src={offerBadge}
        alt="View offer"
        className="w-[54px] md:w-[62px] lg:w-[70px] drop-shadow-lg"
        style={{ background: "transparent" }}
      />
      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-gold drop-shadow-sm">
        VIEW OFFER
      </span>
    </a>
  );
}

