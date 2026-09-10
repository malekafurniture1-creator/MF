import { createClient } from "@supabase/supabase-js";

function getEnv(name: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name]!;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env[name]) {
    return (import.meta as any).env[name];
  }
  return fallback;
}

const BASE_URL = "https://malekafurnitures.com";

const STATIC_URLS = [
  { loc: `${BASE_URL}/`, priority: "1.0", changefreq: "daily" },
  { loc: `${BASE_URL}/explore`, priority: "0.9", changefreq: "daily" },
  { loc: `${BASE_URL}/visit`, priority: "0.8", changefreq: "monthly" },
];

export async function handleSitemapRequest(): Promise<Response> {
  const supabaseUrl =
    getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL", "");
  const supabaseKey =
    getEnv("SUPABASE_PUBLISHABLE_KEY") || getEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");

  let productUrls: string[] = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("products")
        .select("id, updated_at")
        .eq("visible", true);
      if (data) {
        productUrls = data.map(
          (p: { id: string; updated_at: string }) =>
            `  <url>\n    <loc>${BASE_URL}/product/${p.id}</loc>\n    <lastmod>${(p.updated_at ?? "").slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
      }
    } catch {
      // If Supabase is unavailable, serve static pages only
    }
  }

  const staticXml = STATIC_URLS.map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${productUrls.join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
