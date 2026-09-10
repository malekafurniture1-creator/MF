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

type StagedImage = {
  file?: File;
  url: string;
  isPrimary: boolean;
};

type ActiveTab = "home" | "products" | "add-product" | "categories" | "offers";

function Dashboard({ email, session }: { email: string; session: Session | null }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Categories management
  const [categoryList, setCategoryList] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("maleka_custom_categories");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [...CATEGORIES];
  });

  const [hiddenCategories, setHiddenCategories] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("maleka_hidden_categories");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryInput, setEditCategoryInput] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "owner"],
    queryFn: () => fetchProducts({ includeHidden: true }),
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

  const handleStartEdit = async (product: ProductWithImage) => {
    setDraft({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description ?? "",
      image_url: product.image_url,
      featured: product.featured,
      sort_order: product.sort_order,
    });

    let dbImages: any[] = [];
    try {
      const { data } = await (supabase as any)
        .from("product_images")
        .select("image_url, is_primary, sort_order")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) dbImages = data;
    } catch (err) {
      console.warn("Could not fetch product_images:", err);
    }

    if (dbImages.length > 0) {
      setStagedImages(
        dbImages.map((row: any, idx: number) => ({
          url: row.image_url,
          isPrimary: Boolean(row.is_primary ?? idx === 0),
        }))
      );
    } else {
      const imgs = product.images && product.images.length > 0 ? product.images : [product.image_url];
      setStagedImages(
        imgs.map((url, idx) => ({
          url,
          isPrimary: idx === 0,
        }))
      );
    }
    setActiveTab("add-product");
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (stagedImages.length === 0) {
      toast.error("Add at least one photo first");
      return;
    }
    setBusy(true);

    const isNewProduct = !draft.id;
    let productId = draft.id;
    const uploadedB2Urls: string[] = [];

    try {
      const payload = {
        name: draft.name.trim().slice(0, 120),
        category: draft.category,
        description: draft.description.trim().slice(0, 600) || null,
        featured: draft.featured,
        image_url: "",
      };

      if (isNewProduct) {
        // Step 1: Insert product into Supabase database first to get real ID
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error || !data?.id) throw error || new Error("Failed to create product record");
        productId = data.id;
      } else {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);
        if (error) throw error;
      }

      // Step 2: Upload staged files using products/<actual-product-id>/<position>-<random-id>.webp
      const token = session?.access_token || "";
      const finalImages: Array<{ url: string; isPrimary: boolean }> = [];

      for (let i = 0; i < stagedImages.length; i++) {
        const item = stagedImages[i];
        if (item.file) {
          const form = new FormData();
          form.append("file", item.file);
          const prefix = `products/${productId}/`;
          const key = `${prefix}${i}-${crypto.randomUUID().slice(0, 8)}.webp`;
          form.append("prefix", prefix);
          form.append("key", key);

          const resp = await fetch("/api/b2-upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });

          const data = await resp.json();
          if (!resp.ok || !data?.url) {
            throw new Error(data?.error || `Upload failed for photo ${i + 1}`);
          }
          uploadedB2Urls.push(data.url);
          finalImages.push({ url: data.url, isPrimary: item.isPrimary });
        } else if (item.url) {
          finalImages.push({ url: item.url, isPrimary: item.isPrimary });
        }
      }

      // Determine primary image
      let primaryItem = finalImages.find((x) => x.isPrimary) || finalImages[0];
      if (!primaryItem) throw new Error("No images found");
      const primaryUrl = primaryItem.url;

      // Update primary image_url on products record
      const { error: updateErr } = await supabase
        .from("products")
        .update({ image_url: primaryUrl })
        .eq("id", productId);
      if (updateErr) throw updateErr;

      // Step 3: Insert product_images records with sort_order and is_primary
      await (supabase as any).from("product_images").delete().eq("product_id", productId);
      const { error: imgErr } = await (supabase as any).from("product_images").insert(
        finalImages.map((img, index) => ({
          product_id: productId,
          image_url: img.url,
          sort_order: index,
          is_primary: img.isPrimary,
        }))
      );
      if (imgErr) throw imgErr;

      toast.success(isNewProduct ? "Product added" : "Product updated");
      setDraft(null);
      setStagedImages([]);
      refresh();
      setActiveTab("products");
    } catch (error) {
      console.error("Error saving product:", error);
      if (uploadedB2Urls.length > 0) {
        void deleteB2Images(uploadedB2Urls);
      }
      if (isNewProduct && productId) {
        await supabase.from("products").delete().eq("id", productId);
      }
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setBusy(false);
    }
  }

  async function toggleProductVisibility(product: ProductWithImage) {
    const nextVisibility = product.visible === false ? true : false;
    const { error } = await supabase
      .from("products")
      .update({ visible: nextVisibility })
      .eq("id", product.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(nextVisibility ? "Product is now visible" : "Product is now hidden");
      refresh();
    }
  }

  async function remove(product: ProductWithImage) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast.error(error.message);
    } else {
      const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
      void deleteB2Images(allImages);
      toast.success("Product deleted");
      refresh();
    }
  }

  // Category helpers
  function toggleCategoryVisibility(categoryName: string) {
    setHiddenCategories((prev) => {
      const isHidden = prev.includes(categoryName);
      const next = isHidden ? prev.filter((c) => c !== categoryName) : [...prev, categoryName];
      localStorage.setItem("maleka_hidden_categories", JSON.stringify(next));
      toast.success(isHidden ? `Category "${categoryName}" visible` : `Category "${categoryName}" hidden`);
      return next;
    });
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categoryList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    const next = [...categoryList, trimmed];
    setCategoryList(next);
    localStorage.setItem("maleka_custom_categories", JSON.stringify(next));
    setNewCategoryInput("");
    setShowAddCategoryModal(false);
    toast.success(`Category "${trimmed}" added`);
  }

  function handleDeleteCategory(categoryName: string) {
    const count = products.filter((p) => p.category === categoryName).length;
    if (count > 0) {
      toast.error(`Cannot delete category "${categoryName}" because ${count} product(s) use it.`);
      return;
    }
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;
    const next = categoryList.filter((c) => c !== categoryName);
    setCategoryList(next);
    localStorage.setItem("maleka_custom_categories", JSON.stringify(next));
    toast.success(`Category "${categoryName}" deleted`);
  }

  async function handleRenameCategory(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null);
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ category: trimmed })
      .eq("category", oldName);

    if (error) {
      toast.error(error.message);
      return;
    }

    const next = categoryList.map((c) => (c === oldName ? trimmed : c));
    setCategoryList(next);
    localStorage.setItem("maleka_custom_categories", JSON.stringify(next));
    setEditingCategory(null);
    toast.success(`Category renamed to "${trimmed}"`);
    refresh();
  }

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-foreground font-sans">
      <Header />

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            {activeTab === "home" ? (
              <div>
                <h1 className="font-display text-4xl text-foreground">Dashboard</h1>
                <p className="mt-1 text-xs text-muted-foreground">{email}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-display text-2xl md:text-3xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("home")}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="size-5" />
                  Dashboard
                </button>
                <span className="text-muted-foreground font-light">/</span>
                <span className="text-foreground capitalize">
                  {activeTab === "add-product"
                    ? draft?.id
                      ? "Edit Product"
                      : "Add Product"
                    : activeTab}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "products" && (
              <button
                type="button"
                onClick={() => {
                  setStagedImages([]);
                  setDraft({ ...emptyDraft });
                  setActiveTab("add-product");
                }}
                className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
              >
                <Plus className="size-4" /> Add
              </button>
            )}

            {activeTab === "categories" && (
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
              >
                <Plus className="size-4" /> Add
              </button>
            )}

            {activeTab === "offers" && (
              <a
                href="#create-offer-form"
                className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
              >
                <Plus className="size-4" /> Add
              </a>
            )}

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 border border-border bg-background/80 px-3.5 py-2 text-xs font-medium text-foreground hover:border-gold transition-colors"
            >
              <Link className="hidden" />
              <span>View Website</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* ----------------- DASHBOARD HOME ----------------- */}
        {activeTab === "home" && (
          <div className="mx-auto mt-12 max-w-xl space-y-4">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className="group flex w-full items-center gap-5 border border-border/60 bg-background p-6 text-left shadow-sm transition-all hover:border-gold hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-none bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                <Plus className="hidden" />
                <span className="font-display text-2xl font-bold">📦</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                  Products
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">View and manage products</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setStagedImages([]);
                setDraft({ ...emptyDraft });
                setActiveTab("add-product");
              }}
              className="group flex w-full items-center gap-5 border border-border/60 bg-background p-6 text-left shadow-sm transition-all hover:border-gold hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-none bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                <Plus className="size-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                  Add Product
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Upload new catalogue item</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className="group flex w-full items-center gap-5 border border-border/60 bg-background p-6 text-left shadow-sm transition-all hover:border-gold hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-none bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                <span className="font-display text-2xl font-bold">📁</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                  Categories
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Manage collections</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("offers")}
              className="group flex w-full items-center gap-5 border border-border/60 bg-background p-6 text-left shadow-sm transition-all hover:border-gold hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-none bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                <span className="font-display text-2xl font-bold">🏷️</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                  Offers
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Manage promotional banner offers</p>
              </div>
            </button>
          </div>
        )}

        {/* ----------------- PRODUCTS VIEW ----------------- */}
        {activeTab === "products" && (
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
              />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse bg-muted" />
                <div className="h-20 animate-pulse bg-muted" />
                <div className="h-20 animate-pulse bg-muted" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No products found matching your search.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const isVisible = product.visible !== false;
                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center justify-between gap-4 border border-border bg-background p-4 shadow-sm transition-all",
                        !isVisible && "opacity-60 bg-sand/20"
                      )}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-16 shrink-0 object-cover border border-border"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Eye Toggle Hide/Show */}
                        <button
                          type="button"
                          title={isVisible ? "Hide product from site" : "Make product visible on site"}
                          onClick={() => toggleProductVisibility(product)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                        >
                          {isVisible ? (
                            <span className="size-5 text-foreground">👁️</span>
                          ) : (
                            <span className="size-5 text-muted-foreground line-through">👁️</span>
                          )}
                        </button>

                        {/* Trash Delete */}
                        <button
                          type="button"
                          title="Delete product"
                          onClick={() => remove(product)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        {/* Pencil Edit */}
                        <button
                          type="button"
                          title="Edit product"
                          onClick={() => handleStartEdit(product)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- ADD / EDIT PRODUCT FORM ----------------- */}
        {activeTab === "add-product" && draft && (
          <form
            onSubmit={save}
            className="mx-auto mt-8 max-w-3xl grid gap-5 border border-border bg-background p-6 shadow-sm md:p-8"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="font-display text-2xl">
                {draft.id ? "Edit product" : "New product"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Back to products
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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
                  {categoryList.map((c) => (
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

              <div className="md:col-span-2 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="eyebrow">Images ({stagedImages.length} / 4)</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {stagedImages.map((imgItem, i) => (
                    <div
                      key={imgItem.url + i}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", i.toString());
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                        if (isNaN(fromIdx) || fromIdx === i) return;
                        setStagedImages((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(fromIdx, 1);
                          next.splice(i, 0, moved);
                          return next;
                        });
                      }}
                      className="relative group w-[105px] h-[130px] bg-muted overflow-hidden border border-border"
                    >
                      <img src={imgItem.url} className="w-full h-full object-cover pointer-events-none" alt="" />

                      {/* Star Primary Selector */}
                      <button
                        type="button"
                        title={imgItem.isPrimary ? "Primary photo" : "Set as primary photo"}
                        onClick={() => {
                          setStagedImages((prev) =>
                            prev.map((item, idx) => ({ ...item, isPrimary: idx === i }))
                          );
                        }}
                        className="absolute top-1 left-1 bg-black/60 p-1.5 rounded-full hover:bg-black/80 transition-colors z-10"
                      >
                        <Star
                          className={cn(
                            "size-4 transition-colors",
                            imgItem.isPrimary
                              ? "fill-gold text-gold"
                              : "text-white/80 hover:text-white"
                          )}
                        />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => {
                          setStagedImages((prev) => {
                            const next = prev.filter((_, idx) => idx !== i);
                            if (next.length > 0 && !next.some((x) => x.isPrimary)) {
                              next[0].isPrimary = true;
                            }
                            return next;
                          });
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80 z-10"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}

                  {stagedImages.length < 4 && (
                    <div className="flex gap-2">
                      <label className="flex flex-col items-center justify-center w-[105px] h-[130px] border border-dashed border-input text-muted-foreground hover:border-gold cursor-pointer transition-colors p-2 text-center">
                        <Camera className="size-5 mb-2 text-gold" />
                        <span className="text-[0.6rem] uppercase tracking-wider">Take Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []).slice(0, 4 - stagedImages.length);
                            if (files.length) setCropQueue((q) => [...q, ...files]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <label className="flex flex-col items-center justify-center w-[105px] h-[130px] border border-dashed border-input text-muted-foreground hover:border-gold cursor-pointer transition-colors p-2 text-center">
                        <Upload className="size-5 mb-2 text-gold" />
                        <span className="text-[0.6rem] uppercase tracking-wider">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []).slice(0, 4 - stagedImages.length);
                            if (files.length) setCropQueue((q) => [...q, ...files]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 md:col-span-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                    className="size-4 accent-gold"
                  />
                  Featured item
                </label>
              </div>
            </div>

            <div className="flex gap-3 md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-background disabled:opacity-60 hover:bg-foreground/90 transition-colors"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Save product
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setStagedImages([]);
                  setActiveTab("products");
                }}
                className="border border-border px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ----------------- CATEGORIES VIEW ----------------- */}
        {activeTab === "categories" && (
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {showAddCategoryModal && (
              <form onSubmit={handleAddCategory} className="border border-gold bg-background p-4 flex gap-3 items-center shadow-md mb-4">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  className="flex-1 border border-input px-3 py-2 text-sm outline-none focus:border-gold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-foreground text-background px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-foreground/90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="border border-border px-3 py-2 text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
              </form>
            )}

            {categoryList.map((cat) => {
              const productCount = products.filter((p) => p.category === cat).length;
              const isHidden = hiddenCategories.includes(cat);
              const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");

              return (
                <div
                  key={cat}
                  className={cn(
                    "flex items-center justify-between border border-border bg-background p-4 shadow-sm transition-all",
                    isHidden && "opacity-60 bg-sand/20"
                  )}
                >
                  {editingCategory === cat ? (
                    <div className="flex flex-1 items-center gap-3 pr-4">
                      <input
                        type="text"
                        value={editCategoryInput}
                        onChange={(e) => setEditCategoryInput(e.target.value)}
                        className="flex-1 border border-input px-3 py-1.5 text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleRenameCategory(cat, editCategoryInput)}
                        className="bg-foreground text-background px-3 py-1.5 text-xs font-bold uppercase"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="border border-border px-3 py-1.5 text-xs uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-base text-foreground">{cat}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        /{slug} · {productCount} {productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                  )}

                  {editingCategory !== cat && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title={isHidden ? "Show category" : "Hide category"}
                        onClick={() => toggleCategoryVisibility(cat)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded transition-colors"
                      >
                        {isHidden ? (
                          <span className="size-5 text-muted-foreground line-through">👁️</span>
                        ) : (
                          <span className="size-5 text-foreground">👁️</span>
                        )}
                      </button>

                      <button
                        type="button"
                        title="Edit category"
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditCategoryInput(cat);
                        }}
                        className="p-2 text-muted-foreground hover:text-foreground rounded transition-colors"
                      >
                        <Pencil className="size-4" />
                      </button>

                      <button
                        type="button"
                        title="Delete category"
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 text-muted-foreground hover:text-destructive rounded transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ----------------- OFFERS VIEW ----------------- */}
        {activeTab === "offers" && (
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            <OfferManager session={session} />
          </div>
        )}
      </div>

      {cropQueue[0] ? (
        <ImageCropDialog
          file={cropQueue[0]}
          onCancel={() => setCropQueue((items) => items.slice(1))}
          onComplete={(file) => {
            setStagedImages((prev) => [
              ...prev,
              {
                file,
                url: URL.createObjectURL(file),
                isPrimary: prev.length === 0,
              },
            ]);
            setCropQueue((items) => items.slice(1));
          }}
        />
      ) : null}
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

  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [headline, setHeadline] = useState("");
  const [supportingText, setSupportingText] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingOffer(null);
    setHeadline("");
    setSupportingText("");
    setImageUrl("");
    setOriginalPrice("");
    setOfferPrice("");
  }

  function startEditOffer(offer: Offer) {
    setEditingOffer(offer);
    setHeadline(offer.headline);
    setSupportingText(offer.supporting_text ?? "");
    setOriginalPrice(offer.original_price ?? "");
    setOfferPrice(offer.offer_price ?? "");
    setImageUrl(offer.image_url ?? "");
    const el = document.getElementById("create-offer-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  async function saveOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!headline.trim() || !imageUrl.trim()) {
      toast.error("Add an offer headline and upload an image first");
      return;
    }
    setSaving(true);

    if (editingOffer) {
      // Update existing offer
      const { error } = await (supabase as any)
        .from("offers")
        .update({
          headline: headline.trim(),
          supporting_text: supportingText.trim() || null,
          image_url: imageUrl.trim(),
          original_price: originalPrice.trim() || null,
          offer_price: offerPrice.trim() || null,
        })
        .eq("id", editingOffer.id);

      setSaving(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Offer updated");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["owner-offers"] });
        queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      }
    } else {
      // Create new offer
      const { error } = await (supabase as any).from("offers").insert({
        headline: headline.trim(),
        supporting_text: supportingText.trim() || null,
        image_url: imageUrl.trim(),
        original_price: originalPrice.trim() || null,
        offer_price: offerPrice.trim() || null,
        active: true,
      });

      setSaving(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Offer created");
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["owner-offers"] });
        queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      }
    }
  }

  async function uploadOffer(file: File) {
    try {
      const token = session?.access_token || "";
      
      const webpFile = await new Promise<File>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Failed to get canvas context"));
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Failed to convert image to WebP"));
            const filename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            resolve(new File([blob], filename, { type: "image/webp" }));
          }, "image/webp", 0.9);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image for conversion"));
        };
        img.src = objectUrl;
      });

      const form = new FormData();
      form.append("file", webpFile);
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
      toast.success("Offer photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Offer photo upload failed");
    }
  }

  async function toggle(offer: Offer) {
    const nextState = !offer.active;
    const { error } = await (supabase as any).from("offers").update({ active: nextState }).eq("id", offer.id);
    if (error) toast.error(error.message);
    else {
      toast.success(nextState ? "Offer activated" : "Offer deactivated");
      queryClient.invalidateQueries({ queryKey: ["owner-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
    }
  }

  async function remove(offer: Offer) {
    if (!window.confirm(`Delete offer "${offer.headline}"?`)) return;
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
      toast.success("Offer deleted");
      if (editingOffer?.id === offer.id) resetForm();
      queryClient.invalidateQueries({ queryKey: ["owner-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
    }
  }

  return (
    <div className="space-y-6">
      <form id="create-offer-form" onSubmit={saveOffer} className="grid gap-4 border border-border bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-display text-xl font-semibold">
            {editingOffer ? "Edit Offer" : "Create New Offer"}
          </h3>
          {editingOffer && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Offer headline (e.g. Festival Special Offer)"
            className="border border-input px-3 py-2.5 text-sm sm:col-span-2 outline-none focus:border-gold"
            required
          />
          <textarea
            value={supportingText}
            onChange={(e) => setSupportingText(e.target.value)}
            placeholder="Description — what's included, terms, details… (optional)"
            rows={3}
            className="border border-input px-3 py-2.5 text-sm sm:col-span-2 outline-none focus:border-gold resize-none leading-relaxed"
          />
          <input
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Original price (e.g. ₹1,50,000)"
            className="border border-input px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <input
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            placeholder="Offer price (e.g. ₹1,19,999)"
            className="border border-input px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <label className="cursor-pointer border border-dashed border-input p-3 text-sm text-muted-foreground hover:border-gold flex items-center justify-center sm:col-span-2 transition-colors">
            {imageUrl ? (
              <div className="flex items-center gap-3 w-full">
                <img
                  src={imageUrl}
                  alt="Offer preview"
                  className="size-14 shrink-0 object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">✓ Image attached</p>
                  <p className="text-[0.7rem] text-muted-foreground">Click here to replace with another photo</p>
                </div>
                <span className="text-xs border border-border px-3 py-1.5 hover:bg-muted text-foreground uppercase tracking-wider font-medium shrink-0">
                  Change Image
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-1 text-center">
                <Upload className="size-4 text-gold" />
                <span>Upload offer image (Original aspect ratio preserved)</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadOffer(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            disabled={saving}
            className="bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors w-fit"
          >
            {saving ? "Saving..." : editingOffer ? "Update Offer" : "Create Offer"}
          </button>
          {editingOffer && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-border px-5 py-2.5 text-xs uppercase tracking-wider hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-display text-xl font-semibold">Active & Saved Offers</h3>
        {isLoading ? (
          <div className="h-16 animate-pulse bg-muted" />
        ) : offers.length ? (
          offers.map((offer) => (
            <div
              key={offer.id}
              className={cn(
                "flex items-center justify-between gap-4 border border-border bg-background p-4 shadow-sm transition-all",
                !offer.active && "opacity-60 bg-sand/20",
                editingOffer?.id === offer.id && "border-gold ring-1 ring-gold"
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                {offer.image_url ? (
                  <img src={offer.image_url} alt="" className="size-16 shrink-0 object-cover border border-border" />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">{offer.headline}</p>
                  {offer.original_price || offer.offer_price ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {offer.original_price ? <span className="line-through">{offer.original_price}</span> : null}
                      {offer.original_price && offer.offer_price ? " " : ""}
                      {offer.offer_price ? <span className="font-semibold text-foreground">{offer.offer_price}</span> : null}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  title={offer.active ? "Deactivate offer" : "Activate offer"}
                  onClick={() => toggle(offer)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  {offer.active ? (
                    <span className="size-5 text-foreground">👁️</span>
                  ) : (
                    <span className="size-5 text-muted-foreground line-through">👁️</span>
                  )}
                </button>

                <button
                  type="button"
                  title="Edit offer"
                  onClick={() => startEditOffer(offer)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  <Pencil className="size-4" />
                </button>

                <button
                  type="button"
                  title="Delete offer"
                  onClick={() => remove(offer)}
                  className="p-2 text-muted-foreground hover:text-destructive rounded transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground border border-dashed border-border p-8 text-center">
            No promotional offers created yet.
          </p>
        )}
      </div>
    </div>
  );
}

