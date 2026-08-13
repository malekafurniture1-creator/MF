CREATE TYPE public.app_role AS ENUM ('owner');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  image_url text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Owner can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'owner'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.products (name, category, image_url, featured, sort_order) VALUES
('L-Shaped Sectional Sofa with Ottoman', 'Sofas', '/__l5e/assets-v1/2838525c-2f1d-407d-9c4c-841493c18f0b/sectional-sofa.png', true, 1),
('Designer Upholstered King Bed', 'Beds', '/__l5e/assets-v1/c817e190-8ff0-46bb-bbba-65efa5beabe3/designer-bed.png', true, 2),
('Marble-Top Dining Set with Six Chairs', 'Dining', '/__l5e/assets-v1/caf705b0-5361-4959-ad67-fcd8c1103fe1/dining-set.png', true, 3),
('Mirrored Dressing Wardrobe with Shelves', 'Wardrobes', '/__l5e/assets-v1/48850af9-0bf7-4042-93cf-96277dff0833/dressing-wardrobe.webp', true, 4),
('Wooden Wardrobe of 3 doors', 'Commercial', '/__l5e/assets-v1/3d565542-1048-4dbb-b9ce-bbcf8716eaea/showcase-cabinet.webp', true, 5);