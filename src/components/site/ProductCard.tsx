import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Phone } from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultiple = images.length > 1;
  const currentImage = images[currentIndex] || product.image;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const prevImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple || touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diffX = touchStartX.current - touch.clientX;
    const diffY = touchStartY.current - touch.clientY;

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <div
        className="relative overflow-hidden bg-sand select-none touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={currentImage}
          alt={`${product.name} - Photo ${currentIndex + 1}`}
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

        {/* Desktop Left / Right Navigation Arrows */}
        {hasMultiple ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prevImage}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition-all hover:bg-black/70 hover:scale-110 active:scale-95 z-10"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={nextImage}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition-all hover:bg-black/70 hover:scale-110 active:scale-95 z-10"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Pagination Dots Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur-xs z-10 pointer-events-none">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full transition-all duration-300",
                    i === currentIndex ? "bg-white scale-125" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow">{product.category}</p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-1.5 font-display text-2xl leading-snug hover:text-gold"
        >
          {product.name}
        </Link>
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
