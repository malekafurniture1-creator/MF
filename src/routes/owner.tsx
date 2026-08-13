import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Pencil, Plus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/site/Header";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, fetchProducts, type ProductWithImage } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner Dashboard — HI LINE COMFORTS" },
      {
        name: "description",
        content:
          "Private dashboard for HI LINE COMFORTS staff to manage showroom listings.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Dashboard — HI LINE COMFORTS" },
      {
        property: "og:description",
        content: "Private product management for HI LINE COMFORTS.",
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

  return <Dashboard email={session.user.email ?? ""} />;
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
          <p className="eyebrow">HI LINE COMFORTS</p>
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

function Dashboard({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  async function upload(file: File) {
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      setDraft((d) => (d ? { ...d, image_url: path } : d));
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
      const { error } = draft.id
        ? await supabase.from("products").update(payload).eq("id", draft.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
      toast.success(draft.id ? "Product updated" : "Product added");
      setDraft(null);
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
    if (error) toast.error(error.message);
    else {
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
            <button
              type="button"
              onClick={() => setDraft({ ...emptyDraft })}
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

            <div>
              <label className="eyebrow" htmlFor="p-photo">
                Photo
              </label>
              <label
                htmlFor="p-photo"
                className="mt-2 flex cursor-pointer items-center gap-2 border border-dashed border-input px-3 py-2.5 text-sm text-muted-foreground hover:border-gold"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {draft.image_url ? "Replace photo" : "Upload photo"}
              </label>
              <input
                id="p-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
              {draft.image_url ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {draft.image_url}
                </p>
              ) : null}
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

        <div className="mt-10 space-y-3">
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
                    onClick={() =>
                      setDraft({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        description: product.description ?? "",
                        image_url: product.image_url,
                        featured: product.featured,
                        sort_order: product.sort_order,
                      })
                    }
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
      </div>
    </div>
  );
}
