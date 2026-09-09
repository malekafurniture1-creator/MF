-- Catalog data is intentionally separate from presentation: the website reads only
-- published rows while the owner dashboard is allowed to manage the full catalog.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  image_url text,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  supporting_text text,
  original_price text,
  offer_price text,
  image_url text NOT NULL,
  cta_label text NOT NULL DEFAULT 'Enquire about this offer',
  active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.categories (name, slug, sort_order) VALUES
 ('Sofas','sofas',1), ('Beds','beds',2), ('Dining','dining',3), ('Wardrobes','wardrobes',4),
 ('Tables','tables',5), ('Seating','seating',6), ('Mirrors','mirrors',7), ('Study/Office','study-office',8),
 ('Commercial','commercial',9), ('Wedding Sets','wedding-sets',10), ('Shoe Racks & Storage','shoe-racks-storage',11)
ON CONFLICT (name) DO NOTHING;

GRANT SELECT ON public.categories, public.product_images, public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.product_images, public.offers TO authenticated;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible categories" ON public.categories FOR SELECT USING (visible = true);
CREATE POLICY "Owner manages categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.visible = true));
CREATE POLICY "Owner manages product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Anyone can view active offers" ON public.offers FOR SELECT USING (active = true);
CREATE POLICY "Owner manages offers" ON public.offers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
