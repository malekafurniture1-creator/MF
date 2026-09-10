import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Pencil, Plus, Star, Trash2, Upload, Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/site/Header";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, fetchProducts, type ProductWithImage } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Offer } from "@/lib/offers";
import { ImageCropDialog } from "@/components/site/ImageCropDialog";

export const Route = createFileRoute("/owner")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Maleka Furnitures" },
      {
        name: "description",
        content:
          "Private dashboard for Maleka Furnitures staff to manage showroom listings.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Dashboard — Maleka Furnitures" },
      {
        property: "og:description",
        content: "Private product management for Maleka Furnitures.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Owner,
});

type Draft = {
  id?: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  featured: boolean;
  sort_order: number;
};

const emptyDraft: Draft = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  image_url: "",
  featured: false,
  sort_order: 0,
};

function Owner() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsOwner(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "owner")
      .maybeSingle()
      .then(({ data }) => setIsOwner(Boolean(data)));
  }, [session]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return <AuthPanel />;

  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Not authorised</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This account is signed in but has not been granted owner access.
          </p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-6 border border-border px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (isOwner === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Dashboard email={session.user.email ?? ""} session={session} />;
}

function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/owner` },
        });
        if (error) throw error;
        toast.success(
          data.session ? "Account created" : "Check your email to confirm the account",
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-sand/40">
      <Header />
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm border border-border bg-background p-8 shadow-soft">
          <p className="eyebrow">MALEKA FURNITURES</p>
          <h1 className="mt-2 font-display text-3xl">Owner access</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Staff only. Customers can browse the catalogue{" "}
            <Link to="/explore" className="underline">
              here
            </Link>
            .
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="eyebrow" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 bg-foreground px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-background disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-center text-xs text-muted-foreground underline"
          >
            {mode === "signin"
              ? "Need to create the owner account?"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ email, session }: { email: string; session: Session | null }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [extraImagePaths, setExtraImagePaths] = useState<string[]>([]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  async function deleteB2Images(urls: string[]) {
    if (!urls || urls.length === 0) return;
    try {
      const token = session?.access_token || "";
      await fetch("/api/b2-delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      });
    } catch (e) {
      console.warn("Failed to delete B2 images:", e);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const token = session?.access_token || "";
      const form = new FormData();
      form.append("file", file);
      
      const pos = extraImagePaths.length;
      const prefix = draft?.id ? `products/${draft.id}/` : "products/";
      form.append("prefix", prefix);
      form.append("key", `${prefix}${pos}-${crypto.randomUUID().slice(0, 8)}.webp`);

      const resp = await fetch("/api/b2-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || `Upload failed (${resp.status})`);
      }

      // Store proxy URL in draft and add to extraImagePaths
      setDraft((d) => (d ? { ...d, image_url: d.image_url || data.url } : d));
      setExtraImagePaths((paths) => [...paths, data.url]);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.image_url) {
      toast.error("Add a photo first");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: draft.name.trim().slice(0, 120),
        category: draft.category,
        description: draft.description.trim().slice(0, 600) || null,
        image_url: draft.image_url,
        featured: draft.featured,
        sort_order: Number(draft.sort_order) || 0,
      };
      const result = draft.id
        ? await supabase.from("products").update(payload).eq("id", draft.id).select("id").single()
        : await supabase.from("products").insert(payload).select("id").single();
      const { error } = result;
      if (error) throw error;
      const productId = result.data?.id ?? draft.id;
      if (productId && extraImagePaths.length > 0) {
        await (supabase as any).from("product_images").delete().eq("product_id", productId);
        await (supabase as any).from("product_images").insert(
          extraImagePaths.map((image_url, index) => ({
            product_id: productId,
            image_url,
            sort_order: index,
            is_primary: index === 0,
          })),
        );
      }
      toast.success(draft.id ? "Product updated" : "Product added");
      setDraft(null); setExtraImagePaths([]);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFeatured(product: ProductWithImage) {
    const { error } = await supabase
      .from("products")
      .update({ featured: !product.featured })
      .eq("id", product.id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function remove(product: ProductWithImage) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast.error(error.message);
    } else {
      const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
      void deleteB2Images(allImages);
      toast.success("Deleted");
      refresh();
    }
  }

  return (
    <div className="min-h-screen bg-sand/30">
      <Header />

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Owner dashboard</p>
            <h1 className="truncate font-display text-3xl md:text-4xl">
              Manage the catalogue
            </h1>
            <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link to="/" className="inline-flex items-center border border-border px-4 py-3 text-[0.68rem] uppercase tracking-[0.18em]">Home</Link>
            <button
              type="button"
              onClick={() => { setExtraImagePaths([]); setDraft({ ...emptyDraft }); }}
              className="inline-flex items-center gap-2 bg-foreground px-4 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-background"
            >
              <Plus className="size-3.5" />
              Add
            </button>
            <button
              type="button"
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
              }}
              className="inline-flex items-center gap-2 border border-border px-4 py-3 text-[0.68rem] uppercase tracking-[0.18em]"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <a href="#products" className="border border-border bg-background p-5 transition-colors hover:border-gold"><p className="eyebrow">Catalogue</p><p className="mt-2 font-display text-2xl">Products</p><p className="mt-1 text-xs text-muted-foreground">Search, edit, feature or hide pieces.</p></a>
          <button type="button" onClick={() => { setExtraImagePaths([]); setDraft({ ...emptyDraft }); }} className="border border-border bg-background p-5 text-left transition-colors hover:border-gold"><p className="eyebrow">Create</p><p className="mt-2 font-display text-2xl">Add product</p><p className="mt-1 text-xs text-muted-foreground">Up to four cropped WebP images.</p></button>
          <a href="#categories" className="border border-border bg-background p-5 transition-colors hover:border-gold"><p className="eyebrow">Organise</p><p className="mt-2 font-display text-2xl">Categories</p><p className="mt-1 text-xs text-muted-foreground">Manage category visibility and order.</p></a>
        </div>

        {draft ? (
          <form
            onSubmit={save}
            className="mt-8 grid gap-5 border border-border bg-background p-6 md:grid-cols-2 md:p-8"
          >
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl">
                {draft.id ? "Edit product" : "New product"}
              </h2>
            </div>

            <div>
              <label className="eyebrow" htmlFor="p-name">
                Name
              </label>
              <input
                id="p-name"
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-2 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="eyebrow" htmlFor="p-category">
                Category
              </label>
              <select
                id="p-category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="mt-2 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="eyebrow" htmlFor="p-desc">
                Description
              </label>
              <textarea
                id="p-desc"
                rows={3}
                maxLength={600}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="mt-2 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="eyebrow">Images ({extraImagePaths.length} / 4)</label>
              </div>
              <div className="flex flex-wrap gap-3">
                {extraImagePaths.map((url, i) => (
                  <div
                    key={url}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", i.toString());
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                      if (isNaN(fromIdx) || fromIdx === i) return;
                      const next = [...extraImagePaths];
                      const [moved] = next.splice(fromIdx, 1);
                      next.splice(i, 0, moved);
                      setExtraImagePaths(next);
                      setDraft((d) => (d ? { ...d, image_url: next[0] } : d));
                    }}
                    className="relative group w-[100px] h-[125px] bg-muted overflow-hidden border border-border"
                  >
                    <img src={url} className="w-full h-full object-cover pointer-events-none" alt="" />
                    {i === 0 && (
                      <div className="absolute top-0 left-0 bg-gold text-[0.55rem] uppercase px-1 py-0.5 text-black font-bold">
                        Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const next = extraImagePaths.filter((_, idx) => idx !== i);
                        setExtraImagePaths(next);
                        setDraft((d) => (d ? { ...d, image_url: next[0] || "" } : d));
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                    <div className="absolute bottom-0 w-full flex justify-between bg-black/40 p-1 md:hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (i > 0) {
                            const next = [...extraImagePaths];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            setExtraImagePaths(next);
                            setDraft((d) => (d ? { ...d, image_url: next[0] } : d));
                          }
                        }}
                      >
                        <ChevronLeft className="size-4 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const next = extraImagePaths.filter((_, idx) => idx !== i);
                          setExtraImagePaths(next);
                          setDraft((d) => (d ? { ...d, image_url: next[0] || "" } : d));
                        }}
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (i < extraImagePaths.length - 1) {
                            const next = [...extraImagePaths];
                            [next[i], next[i + 1]] = [next[i + 1], next[i]];
                            setExtraImagePaths(next);
                            setDraft((d) => (d ? { ...d, image_url: next[0] } : d));
                          }
                        }}
                      >
                        <ChevronRight className="size-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {extraImagePaths.length < 4 && (
                  <div className="flex gap-2">
                    {uploading ? (
                      <div className="flex items-center justify-center w-[100px] h-[125px] border border-dashed border-input text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <label className="flex flex-col items-center justify-center w-[100px] h-[125px] border border-dashed border-input text-muted-foreground hover:border-gold cursor-pointer transition-colors p-2 text-center">
                          <Camera className="size-5 mb-2" />
                          <span className="text-[0.6rem] uppercase">Take Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []).slice(0, 4 - extraImagePaths.length);
                              if (files.length) setCropQueue((q) => [...q, ...files]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <label className="flex flex-col items-center justify-center w-[100px] h-[125px] border border-dashed border-input text-muted-foreground hover:border-gold cursor-pointer transition-colors p-2 text-center">
                          <Upload className="size-5 mb-2" />
                          <span className="text-[0.6rem] uppercase">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []).slice(0, 4 - extraImagePaths.length);
                              if (files.length) setCropQueue((q) => [...q, ...files]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div>
                <label className="eyebrow" htmlFor="p-order">
                  Sort order
                </label>
                <input
                  id="p-order"
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft({ ...draft, sort_order: Number(e.target.value) })
                  }
                  className="mt-2 w-24 border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>
              <label className="flex items-center gap-2 pb-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  className="size-4 accent-current"
                />
                Featured
              </label>
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={busy || uploading}
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-background disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Save
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="border border-border px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div id="products" className="mt-10 space-y-3">
          {isLoading ? (
            <div className="h-24 animate-pulse bg-muted" />
          ) : products.length === 0 ? (
            <p className="border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No products yet. Add your first piece.
            </p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border border-border bg-background p-3 sm:flex sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-16 shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="eyebrow pt-1">
                      {product.category} · #{product.sort_order}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(product)}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-3 py-2 text-[0.65rem] uppercase tracking-[0.14em]",
                      product.featured
                        ? "border-gold bg-gold/15 text-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <Star
                      className={cn("size-3.5", product.featured && "fill-gold text-gold")}
                    />
                    Featured
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        description: product.description ?? "",
                        image_url: product.image_url,
                        featured: product.featured,
                        sort_order: product.sort_order,
                      });
                      setExtraImagePaths(product.images && product.images.length > 0 ? product.images : [product.image_url]);
                    }}
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[0.65rem] uppercase tracking-[0.14em]"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    className="inline-flex items-center gap-1.5 border border-destructive/40 px-3 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <section id="categories" className="mt-16 border-t border-border pt-10"><p className="eyebrow">Categories</p><h2 className="font-display text-3xl">Collection groups</h2><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{CATEGORIES.map((category) => <div key={category} className="flex items-center justify-between border border-border bg-background p-4"><span className="text-sm">{category}</span><span className="text-xs text-muted-foreground">Active</span></div>)}</div></section>
        <OfferManager session={session} />
      </div>
      {cropQueue[0] ? <ImageCropDialog file={cropQueue[0]} onCancel={() => setCropQueue((items) => items.slice(1))} onComplete={(file) => { void upload(file); setCropQueue((items) => items.slice(1)); }} /> : null}
    </div>
  );
}

function OfferManager({ session }: { session: Session | null }) {
  const queryClient = useQueryClient();
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["owner-offers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("offers").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Offer[];
    },
  });
  const [headline, setHeadline] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [offerCrop, setOfferCrop] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function createOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!headline.trim() || !imageUrl.trim()) {
      toast.error("Add an offer headline and image URL");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("offers").insert({
      headline: headline.trim(),
      image_url: imageUrl.trim(),
      original_price: originalPrice.trim() || null,
      offer_price: offerPrice.trim() || null,
      active: false,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      setHeadline("");
      setImageUrl("");
      setOriginalPrice("");
      setOfferPrice("");
      toast.success("Offer created as inactive");
      queryClient.invalidateQueries({ queryKey: ["owner-offers"] });
    }
  }
  async function uploadOffer(file: File) {
    try {
      const token = session?.access_token || "";
      const form = new FormData();
      form.append("file", file);
      form.append("prefix", "offers/");

      const resp = await fetch("/api/b2-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || `Upload failed (${resp.status})`);
      }

      setImageUrl(data.url);
      toast.success("Offer photo prepared");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Offer photo upload failed");
    }
  }

  async function toggle(offer: Offer) {
    const { error } = await (supabase as any).from("offers").update({ active: !offer.active }).eq("id", offer.id);
    if (error) toast.error(error.message); else { queryClient.invalidateQueries({ queryKey: ["owner-offers"] }); queryClient.invalidateQueries({ queryKey: ["active-offers"] }); }
  }
  async function remove(offer: Offer) {
    if (!window.confirm(`Delete "${offer.headline}"?`)) return;
    const { error } = await (supabase as any).from("offers").delete().eq("id", offer.id);
    if (error) {
      toast.error(error.message);
    } else {
      if (offer.image_url) {
        try {
          const token = session?.access_token || "";
          void fetch("/api/b2-delete", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ urls: [offer.image_url] }),
          });
        } catch {}
      }
      queryClient.invalidateQueries({ queryKey: ["owner-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
    }
  }
  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Offer management</p>
          <h2 className="font-display text-3xl">Featured offers</h2>
        </div>
        <span className="text-xs text-muted-foreground">Only active offers appear on the website.</span>
      </div>
      <form onSubmit={createOffer} className="mt-6 grid gap-3 border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Offer headline"
          className="border border-input px-3 py-2 text-sm sm:col-span-2"
          required
        />
        <input
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          placeholder="Original price (optional, e.g. ₹1,50,000)"
          className="border border-input px-3 py-2 text-sm"
        />
        <input
          value={offerPrice}
          onChange={(e) => setOfferPrice(e.target.value)}
          placeholder="Offer price (optional, e.g. ₹1,19,999)"
          className="border border-input px-3 py-2 text-sm"
        />
        <label className="cursor-pointer border border-dashed border-input px-3 py-2 text-sm text-muted-foreground flex items-center justify-center sm:col-span-2 lg:col-span-3">
          {imageUrl ? "Offer image prepared" : "Upload offer image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadOffer(file);
            }}
          />
        </label>
        <button
          disabled={saving}
          className="bg-foreground px-4 py-2 text-[.65rem] uppercase tracking-[.14em] text-background hover:opacity-90 disabled:opacity-50"
        >
          Create offer
        </button>
      </form>
      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="h-14 animate-pulse bg-muted" />
        ) : offers.length ? (
          offers.map((offer) => (
            <div key={offer.id} className="flex items-center justify-between gap-3 border border-border bg-background p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{offer.headline}</p>
                {offer.original_price || offer.offer_price ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {offer.original_price ? <span className="line-through">{offer.original_price}</span> : null}
                    {offer.original_price && offer.offer_price ? " " : ""}
                    {offer.offer_price ? <span className="font-semibold text-foreground">{offer.offer_price}</span> : null}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggle(offer)}
                  className="border border-border px-3 py-1.5 text-[.6rem] uppercase tracking-wider"
                >
                  {offer.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(offer)}
                  className="border border-destructive/40 px-3 py-1.5 text-[.6rem] uppercase tracking-wider text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No offers created.</p>
        )}
      </div>
    </section>
  );
}
