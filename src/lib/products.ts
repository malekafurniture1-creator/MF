import { supabase } from "@/integrations/supabase/client";
import { localAssetByFilename } from "@/lib/local-assets";

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
};

export type ProductWithImage = Product & { image: string };

export const CATEGORIES = [
  "Sofas",
  "Beds",
  "Dining",
  "Wardrobes",
  "Tables",
  "Seating",
  "Mirrors",
  "Study/Office",
  "Commercial",
] as const;

export type Category = (typeof CATEGORIES)[number];

const isDirectUrl = (value: string) =>
  value.startsWith("/") || value.startsWith("http");

const localImageFor = (value: string) => {
  const filename = value.split("/").pop();
  return filename ? localAssetByFilename[filename] : undefined;
};

/** Resolves storage paths to signed URLs; CDN/absolute URLs pass through. */
export async function withImageUrls(
  rows: Product[],
): Promise<ProductWithImage[]> {
  const paths = rows.filter((r) => !isDirectUrl(r.image_url)).map((r) => r.image_url);
  const signed = new Map<string, string>();

  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from("product-images")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    data?.forEach((entry) => {
      if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
    });
  }

  return rows.map((row) => ({
    ...row,
    image: localImageFor(row.image_url) ?? (isDirectUrl(row.image_url)
      ? row.image_url
      : (signed.get(row.image_url) ?? "")),
  }));
}

export async function fetchProducts(): Promise<ProductWithImage[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return withImageUrls((data ?? []) as Product[]);
}

export async function fetchProduct(id: string): Promise<ProductWithImage | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const [product] = await withImageUrls([data as Product]);
  return product ?? null;
}
