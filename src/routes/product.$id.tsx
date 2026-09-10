import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Phone, X } from "lucide-react";
import { useState, useRef } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { fetchProduct } from "@/lib/products";
import { productEnquiryUrl, telUrl } from "@/lib/business";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params: { id } }) => {
    try {
      return await fetchProduct(id);
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Piece Unavailable — Maleka Furnitures" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${loaderData.name} — Maleka Furnitures` },
        {
          name: "description",
          content: loaderData.description || `Browse the ${loaderData.category} collection at Maleka Furnitures in Moghalpura, Hyderabad.`,
        },
        { property: "og:url", content: `https://malekafurnitures.com/product/${loaderData.id}` },
        { property: "og:title", content: `${loaderData.name} — Maleka Furnitures` },
        {
          property: "og:description",
          content: loaderData.description || `Browse the ${loaderData.category} collection at Maleka Furnitures in Moghalpura, Hyderabad.`,
        },
        { property: "og:image", content: loaderData.image },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, isLightbox = false) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    touchStartX.current = null;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next image
        if (isLightbox) {
          setLightboxIndex((idx) => (idx + 1) % images.length);
        } else {
          setSelectedIndex((idx) => (idx + 1) % images.length);
        }
      } else {
        // swipe right -> prev image
        if (isLightbox) {
          setLightboxIndex((idx) => (idx - 1 + images.length) % images.length);
        } else {
          setSelectedIndex((idx) => (idx - 1 + images.length) % images.length);
        }
      }
    }
  };

  const hasMultiple = images.length > 1;
  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div
        className="relative overflow-hidden bg-sand aspect-[4/5] rounded-none group cursor-zoom-in border border-border"
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, false)}
      >
        <img
          src={currentImage}
          alt={name}
          onClick={() => {
            setLightboxIndex(selectedIndex);
            setLightboxOpen(true);
          }}
          className="w-full h-full object-cover transition-opacity duration-200"
          loading="eager"
        />

        {/* Desktop Prev/Next Buttons */}
        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((idx) => (idx - 1 + images.length) % images.length);
              }}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((idx) => (idx + 1) % images.length);
              }}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Count indicator badge */}
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[0.65rem] px-2.5 py-1 tracking-wider uppercase backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative size-16 md:size-20 shrink-0 overflow-hidden border transition-all",
                idx === selectedIndex ? "border-gold ring-1 ring-gold" : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <img src={img} alt={`${name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 touch-none">
          <button
            type="button"
            aria-label="Close fullscreen view"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, true)}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${name} fullscreen`}
              className="max-w-full max-h-[85vh] object-contain select-none"
            />

            {hasMultiple && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => setLightboxIndex((idx) => (idx - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => setLightboxIndex((idx) => (idx + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="size-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-xs tracking-widest uppercase bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                  {lightboxIndex + 1} of {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[.7rem] uppercase tracking-[.16em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="opacity-50">/</span>
          <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          {product && (
            <>
              <span className="opacity-50">/</span>
              <Link to="/explore" search={{ category: product.category }} className="hover:text-foreground transition-colors">
                {product.category}
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-foreground line-clamp-1 max-w-[200px] sm:max-w-xs">{product.name}</span>
            </>
          )}
        </nav>
        {isLoading ? (
          <div className="mt-8 aspect-[4/5] max-w-lg animate-pulse bg-muted" />
        ) : !product ? (
          <div className="mt-10 border border-dashed border-border p-12 text-center">
            <h1 className="font-display text-3xl">This piece is unavailable</h1>
            <Link to="/explore" className="mt-5 inline-block underline">
              Browse the catalogue
            </Link>
          </div>
        ) : (
          <article className="mt-8 grid gap-10 md:grid-cols-2 items-start">
            <ProductGallery images={product.images && product.images.length > 0 ? product.images : [product.image]} name={product.name} />
            <div className="flex flex-col justify-center">
              <p className="eyebrow">{product.category}</p>
              <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
              {product.description ? (
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              ) : null}
              {product.tags?.length ? (
                <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">
                  {product.tags.join(" · ")}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={productEnquiryUrl(product.name, product.category)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[.7rem] uppercase tracking-[.16em] text-background hover:bg-foreground/90 transition-colors"
                >
                  <MessageCircle className="size-3.5" />
                  WhatsApp enquiry
                </a>
                <a
                  href={telUrl}
                  className="inline-flex items-center gap-2 border border-border px-5 py-3 text-[.7rem] uppercase tracking-[.16em] hover:border-gold transition-colors"
                >
                  <Phone className="size-3.5" />
                  Call showroom
                </a>
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}

