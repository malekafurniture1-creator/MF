import { MessageCircle, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { ProductWithImage } from "@/lib/products";
import { cn } from "@/lib/utils";

type Props = {
  product: ProductWithImage;
  className?: string;
  ratio?: "wide" | "tall" | "square";
  priority?: boolean;
};

const ratioClass = {
  wide: "aspect-[16/10]",
  tall: "aspect-[3/4]",
  square: "aspect-[4/3]",
};

export function ProductCard({ product, className, ratio = "square", priority }: Props) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className={cn("group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold", className)}
      aria-label={`View ${product.name}`}
    >
      <article className="flex h-full flex-col">
        <div className="relative overflow-hidden bg-sand">
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              ratioClass[ratio],
            )}
          />
          {product.featured ? (
            <span className="absolute left-4 top-4 bg-background/90 px-3 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-foreground pointer-events-none">
              Featured
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col pt-4">
          <p className="eyebrow">{product.category}</p>
          <span className="mt-1.5 font-display text-2xl leading-snug group-hover:text-gold">{product.name}</span>
          {product.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-background transition-opacity group-hover:opacity-85">
              <MessageCircle className="size-3.5" /> Enquire
            </span>
            <span className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] group-hover:border-foreground">
              <Phone className="size-3.5" /> Call
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
