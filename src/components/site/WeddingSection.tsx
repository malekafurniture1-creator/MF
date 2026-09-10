import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { weddingSet1, weddingSet2 } from "@/lib/local-assets";
import { whatsappUrl } from "@/lib/business";

export function WeddingSection() {
  return (
    <section className="bg-[#351c12] text-[#fff4df]">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <p className="eyebrow text-gold">Wedding furniture</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl leading-[.96] md:text-6xl">
          One order. The whole <span className="text-gold italic">shaadi ghar.</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#fff4df]/70">
          Complete, coordinated furniture packages for your new home — selected, finished and delivered together.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <WeddingCard
            image={weddingSet1}
            title="Murad Complete Wedding Set"
            text="King bed with its matching dressing table, wardrobe, side tables and stools — delivered as one set."
          />
          <WeddingCard
            image={weddingSet2}
            title="Ivory Gold Bridal Suite"
            text="A regal king bed, built-in wardrobe, dressing mirror and everyday essentials."
          />
        </div>

        <div className="mt-5 grid gap-5 border-t border-[#fff4df]/20 pt-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <p className="eyebrow text-gold">What a complete set includes</p>
            <p className="mt-2 text-xs leading-6 text-[#fff4df]/70">
              ✓ King or queen bed with headboard
              <br />
              ✓ Wardrobe, dressing table & seating
            </p>
          </div>
          <div className="text-xs leading-6 text-[#fff4df]/70">
            ✓ Design advice and room visit
            <br />
            ✓ Delivery and placement on your day
          </div>
          <Link
            to="/explore"
            search={{ category: "Wedding Sets" }}
            className="inline-flex items-center justify-center gap-2 bg-[#e9c47b] px-5 py-3 text-[.65rem] uppercase tracking-[.18em] text-[#351c12] transition-colors hover:bg-[#dfba70]"
          >
            Plan a wedding set <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WeddingCard({
  image,
  title,
  text,
}: {
  image: string;
  title: string;
  text: string;
}) {
  return (
    <a
      href={whatsappUrl(
        `Hello Maleka Furnitures, I would like to plan a wedding furniture package: ${title}.`,
      )}
      target="_blank"
      rel="noreferrer"
      className="group border border-[#fff4df]/15 bg-[#4b2b1c] p-2"
    >
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-3 font-display text-xl">{title}</h3>
      <p className="mt-1 pb-2 text-xs leading-relaxed text-[#fff4df]/65">{text}</p>
    </a>
  );
}
