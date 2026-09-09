-- MALEKA FURNITURES: fresh Supabase setup
-- Run this entire file ONCE in the Supabase SQL Editor for a brand-new project.
-- Do not run the older files in supabase/migrations as well.
-- This creates structure and categories only; it deliberately creates no sample products or offers.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('owner');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role); $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  image_url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null,
  description text check (description is null or char_length(description) <= 600),
  image_url text not null,
  featured boolean not null default false,
  visible boolean not null default true,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  headline text not null check (char_length(headline) between 1 and 140),
  supporting_text text check (supporting_text is null or char_length(supporting_text) <= 600),
  original_price text,
  offer_price text,
  image_url text not null,
  cta_label text not null default 'Enquire about this offer',
  active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists offers_updated_at on public.offers;
create trigger offers_updated_at before update on public.offers for each row execute function public.set_updated_at();

create index if not exists products_catalog_idx on public.products (visible, featured desc, sort_order, created_at desc);
create index if not exists products_category_idx on public.products (category, visible, created_at desc);
create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);
create index if not exists offers_active_idx on public.offers (active, sort_order);

alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.offers enable row level security;

-- Safe to repeat: remove policies before creating their canonical versions.
drop policy if exists "read own role" on public.user_roles;
create policy "read own role" on public.user_roles for select to authenticated using (auth.uid() = user_id);

drop policy if exists "public reads visible categories" on public.categories;
create policy "public reads visible categories" on public.categories for select using (visible = true);
drop policy if exists "owner manages categories" on public.categories;
create policy "owner manages categories" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'owner')) with check (public.has_role(auth.uid(), 'owner'));

drop policy if exists "public reads visible products" on public.products;
create policy "public reads visible products" on public.products for select using (visible = true);
drop policy if exists "owner manages products" on public.products;
create policy "owner manages products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'owner')) with check (public.has_role(auth.uid(), 'owner'));

drop policy if exists "public reads images for visible products" on public.product_images;
create policy "public reads images for visible products" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and p.visible = true));
drop policy if exists "owner manages product images" on public.product_images;
create policy "owner manages product images" on public.product_images for all to authenticated using (public.has_role(auth.uid(), 'owner')) with check (public.has_role(auth.uid(), 'owner'));

drop policy if exists "public reads active offers" on public.offers;
create policy "public reads active offers" on public.offers for select using (active = true);
drop policy if exists "owner manages offers" on public.offers;
create policy "owner manages offers" on public.offers for all to authenticated using (public.has_role(auth.uid(), 'owner')) with check (public.has_role(auth.uid(), 'owner'));

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.offers to anon;
grant select on public.user_roles, public.categories, public.products, public.product_images, public.offers to authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.offers to authenticated;
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Temporary storage bucket used by the current website. When R2 is connected,
-- its public URLs can be stored in image_url without changing these tables.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', false, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "public reads maleka images" on storage.objects;
create policy "public reads maleka images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "owner uploads maleka images" on storage.objects;
create policy "owner uploads maleka images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'owner'));
drop policy if exists "owner updates maleka images" on storage.objects;
create policy "owner updates maleka images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'owner')) with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'owner'));
drop policy if exists "owner deletes maleka images" on storage.objects;
create policy "owner deletes maleka images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'owner'));

insert into public.categories (name, slug, sort_order) values
 ('Sofas','sofas',1), ('Beds','beds',2), ('Dining','dining',3), ('Wardrobes','wardrobes',4),
 ('Tables','tables',5), ('Seating','seating',6), ('Mirrors','mirrors',7), ('Study/Office','study-office',8),
 ('Commercial','commercial',9), ('Wedding Sets','wedding-sets',10), ('Shoe Racks & Storage','shoe-racks-storage',11)
on conflict (name) do nothing;

-- LAST STEP AFTER you create your owner user in Supabase Authentication:
-- Replace PASTE_AUTH_USER_UUID_HERE with that user's UUID and run this one line.
-- insert into public.user_roles (user_id, role) values ('PASTE_AUTH_USER_UUID_HERE', 'owner') on conflict (user_id, role) do nothing;
