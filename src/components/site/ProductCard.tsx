import { MessageCircle, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { ProductWithImage } from "@/lib/products";
import { productEnquiryUrl, telUrl } from "@/lib/business";
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
    <article className={cn("group flex h-full flex-col", className)}>
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
          <span className="absolute left-4 top-4 bg-background/90 px-3 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-foreground">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow">{product.category}</p>
        <Link to="/product/$id" params={{ id: product.id }} className="mt-1.5 font-display text-2xl leading-snug hover:text-gold">{product.name}</Link>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
          <a
            href={productEnquiryUrl(product.name, product.category)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-85"
          >
            <MessageCircle className="size-3.5" />
            Enquire
          </a>
          <a
            href={telUrl}
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] transition-colors hover:border-foreground"
          >
            <Phone className="size-3.5" />
            Call
          </a>
        </div>
      </div>
    </article>
  );
}
