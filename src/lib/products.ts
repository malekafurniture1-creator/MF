import { supabase } from "@/integrations/supabase/client";
import { localAssetByFilename } from "@/lib/local-assets";
import { PROXY_BASE } from "@/lib/b2";

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string;
  featured: boolean;
  visible: boolean;
  tags: string[];
  sort_order: number;
  created_at: string;
};

export type ProductWithImage = Product & {
  image: string;
  images: string[];
};

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
  "Wedding Sets",
  "Shoe Racks & Storage",
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
  if (rows.length === 0) return [];

  const productIds = rows.map((r) => r.id);

  // Fetch secondary/multiple images from product_images table
  let productImagesData: any[] = [];
  try {
    const { data } = await (supabase as any)
      .from("product_images")
      .select("product_id, image_url, sort_order, is_primary")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true });
    if (data) productImagesData = data;
  } catch (err) {
    console.error("Error fetching product_images:", err);
  }

  // Group raw image URLs by product_id
  const rawImagesByProductId = new Map<string, string[]>();
  productImagesData.forEach((row: any) => {
    const list = rawImagesByProductId.get(row.product_id) || [];
    if (row.image_url) list.push(row.image_url);
    rawImagesByProductId.set(row.product_id, list);
  });

  // Collect all storage paths that need signing
  const pathsToSign: string[] = [];
  rows.forEach((r) => {
    if (r.image_url && !isDirectUrl(r.image_url) && !localImageFor(r.image_url)) {
      pathsToSign.push(r.image_url);
    }
  });
  productImagesData.forEach((row: any) => {
    if (row.image_url && !isDirectUrl(row.image_url) && !localImageFor(row.image_url)) {
      pathsToSign.push(row.image_url);
    }
  });

  const signed = new Map<string, string>();
  if (pathsToSign.length > 0) {
    try {
      const { data } = await supabase.storage
        .from("product-images")
        .createSignedUrls(Array.from(new Set(pathsToSign)), 60 * 60 * 24 * 7);
      data?.forEach((entry) => {
        if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
      });
    } catch (err) {
      console.error("Error signing storage URLs:", err);
    }
  }

  const resolveUrl = (raw: string): string => {
    if (!raw) return "";
    const local = localImageFor(raw);
    if (local) return local;
    if (isDirectUrl(raw)) return raw;
    const storageSigned = signed.get(raw);
    if (storageSigned) return storageSigned;
    if (raw.startsWith("products/") || raw.startsWith("offers/") || raw.includes("-")) {
      return `${PROXY_BASE}/images/${raw.replace(/^\/+/, "")}`;
    }
    return raw;
  };

  return rows.map((row) => {
    const primaryImage = resolveUrl(row.image_url);
    const extraRawImages = rawImagesByProductId.get(row.id) || [];
    const resolvedExtraImages = extraRawImages.map(resolveUrl).filter(Boolean);

    let allImages: string[] = [];
    if (resolvedExtraImages.length > 0) {
      allImages = Array.from(new Set(resolvedExtraImages));
      if (primaryImage && !allImages.includes(primaryImage)) {
        allImages = [primaryImage, ...allImages];
      }
    } else if (primaryImage) {
      allImages = [primaryImage];
    }

    allImages = Array.from(new Set(allImages));

    return {
      ...row,
      image: primaryImage || allImages[0] || "",
      images: allImages,
    };
  });
}

export async function fetchProducts(): Promise<ProductWithImage[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("visible", true)
    .order("featured", { ascending: false })
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
