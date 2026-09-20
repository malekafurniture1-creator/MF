import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ProductCard } from "@/components/site/ProductCard";
import { FurnitureSilhouette } from "@/components/site/FurnitureSilhouette";
import { whatsappUrl } from "@/lib/business";
import { fetchCategories, fetchExplorePage, type ProductCursor } from "@/lib/products";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

type Search = { category?: string | undefined };

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["category"] === "string"
      ? { category: search["category"] }
      : {},
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/explore` }],
    meta: [
      { title: "Explore the Collection — MALEKA Furnitures Hyderabad" },
      {
        name: "description",
        content:
          "Browse sofas, beds, dining sets, wedding sets and storage at MALEKA Furnitures in Moghalpura, Hyderabad.",
      },
      { property: "og:url", content: `${SITE_URL}/explore` },
      { property: "og:title", content: "Explore the Collection — MALEKA Furnitures" },
      {
        property: "og:description",
        content:
          "The full MALEKA Furnitures catalogue, filterable by category, with direct enquiry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoryRecords = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", "public"],
    queryFn: () => fetchCategories(),
  });
  const categories = categoryRecords.map((record) => record.name);
  const selectedCategoryIsVisible = !category || categories.includes(category);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["explore-products", category ?? null, searchQuery.trim(), categories],
    initialPageParam: undefined as ProductCursor | undefined,
    enabled: !categoriesLoading && selectedCategoryIsVisible,
    queryFn: ({ pageParam }) => fetchExplorePage({ category, search: searchQuery, cursor: pageParam, visibleCategories: categories }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const displayedProducts = data?.pages.flatMap((page) => page.products) ?? [];
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: "600px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedProducts.length, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border/70 bg-sand/50">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
          <p className="eyebrow">The catalogue</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight md:text-6xl">
            Everything currently on our showroom floor
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Browse furniture in Hyderabad by category, then send an enquiry for
            current pricing, sizes and finish options. We quote per piece.
          </p>
          
          <div className="mt-8 max-w-md">
            <input
              type="text"
              placeholder="Search pieces by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>
        </div>
      </section>

      <section className="sticky top-[4.4rem] z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 md:px-8">
          <button
            type="button"
            onClick={() => navigate({ search: {} })}
            className={cn(
              "shrink-0 border px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
              !category
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => navigate({ search: { category: c } })}
              className={cn(
                "flex shrink-0 items-center gap-2 border px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                category === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              <FurnitureSilhouette name={c} className="h-3.5 w-5" />
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse bg-muted" />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center">
            <p className="font-display text-3xl">Nothing here yet</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Ask us what's available in this category.
            </p>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block bg-foreground px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-background"
            >
              Send an enquiry
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <p className="eyebrow">
                Showing {displayedProducts.length}{" "}
                {displayedProducts.length === 1 ? "piece" : "pieces"}
                {category ? ` · ${category}` : ""}
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  ratio="tall"
                />
              ))}
            </div>

            {hasNextPage ? <div ref={loadMoreRef} className="mt-16 text-center text-sm text-muted-foreground" aria-live="polite">{isFetchingNextPage ? "Loading more…" : ""}</div> : null}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
