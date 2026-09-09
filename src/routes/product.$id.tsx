import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { fetchProduct } from "@/lib/products";
import { productEnquiryUrl, telUrl } from "@/lib/business";

export const Route = createFileRoute("/product/$id")({ component: ProductDetail });

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useQuery({ queryKey: ["product", id], queryFn: () => fetchProduct(id) });
  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
    <Link to="/explore" search={product ? { category: product.category } : {}} className="inline-flex items-center gap-2 text-[.7rem] uppercase tracking-[.16em] text-muted-foreground"><ArrowLeft className="size-3.5" />Back to collection</Link>
    {isLoading ? <div className="mt-8 aspect-[16/9] animate-pulse bg-muted" /> : !product ? <div className="mt-10 border border-dashed border-border p-12 text-center"><h1 className="font-display text-3xl">This piece is unavailable</h1><Link to="/explore" className="mt-5 inline-block underline">Browse the catalogue</Link></div> : <article className="mt-8 grid gap-10 md:grid-cols-2"><div className="overflow-hidden bg-sand"><img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" /></div><div className="flex flex-col justify-center"><p className="eyebrow">{product.category}</p><h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">{product.name}</h1>{product.description ? <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p> : null}{product.tags?.length ? <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{product.tags.join(" · ")}</p> : null}<div className="mt-8 flex flex-wrap gap-3"><a href={productEnquiryUrl(product.name, product.category)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[.7rem] uppercase tracking-[.16em] text-background"><MessageCircle className="size-3.5" />WhatsApp enquiry</a><a href={telUrl} className="inline-flex items-center gap-2 border border-border px-5 py-3 text-[.7rem] uppercase tracking-[.16em]"><Phone className="size-3.5" />Call showroom</a></div></div></article>}
  </main><Footer /></div>;
}
