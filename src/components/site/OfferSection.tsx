import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useState } from "react";

import { fetchActiveOffers, offerEnquiryUrl } from "@/lib/offers";

export function OfferSection() {
  const { data: offers = [], isLoading } = useQuery({ queryKey: ["active-offers"], queryFn: fetchActiveOffers });
  const [index, setIndex] = useState(0);
  if (isLoading || offers.length === 0) return null;
  const offer = offers[index % offers.length];
  const next = (delta: number) => setIndex((value) => (value + delta + offers.length) % offers.length);

  return (
    <section id="offers" className="border-b border-border bg-sand/50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-5 flex items-center justify-between"><p className="eyebrow">Featured offer</p>{offers.length > 1 ? <p className="text-xs text-muted-foreground">{index + 1} / {offers.length}</p> : null}</div>
        <article className="grid overflow-hidden border border-border bg-background md:grid-cols-2">
          <img src={offer.image_url} alt={offer.headline} className="aspect-[16/10] h-full w-full object-cover md:aspect-auto" />
          <div className="flex flex-col justify-center p-7 md:p-12">
            <h2 className="font-display text-4xl leading-tight md:text-5xl">{offer.headline}</h2>
            {offer.supporting_text ? <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{offer.supporting_text}</p> : null}
            <div className="mt-6 flex items-baseline gap-3">{offer.original_price ? <span className="text-sm text-muted-foreground line-through">{offer.original_price}</span> : null}{offer.offer_price ? <span className="font-display text-3xl text-gold">{offer.offer_price}</span> : null}</div>
            <a href={offerEnquiryUrl(offer.headline)} target="_blank" rel="noreferrer" className="mt-7 inline-flex w-fit items-center gap-2 bg-foreground px-5 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-background"><MessageCircle className="size-3.5" />{offer.cta_label}</a>
          </div>
        </article>
        {offers.length > 1 ? <div className="mt-4 flex justify-end gap-2"><button aria-label="Previous offer" onClick={() => next(-1)} className="border border-border p-2"><ChevronLeft className="size-4" /></button><button aria-label="Next offer" onClick={() => next(1)} className="border border-border p-2"><ChevronRight className="size-4" /></button></div> : null}
      </div>
    </section>
  );
}

export function FloatingOfferButton() {
  const { data: offers = [] } = useQuery({ queryKey: ["active-offers"], queryFn: fetchActiveOffers });
  if (!offers.length) return null;
  return <a href="#offers" className="fixed bottom-20 right-5 z-40 bg-gold px-4 py-3 text-[0.65rem] uppercase tracking-[0.16em] text-foreground shadow-lg transition-transform hover:-translate-y-1">View offer</a>;
}
