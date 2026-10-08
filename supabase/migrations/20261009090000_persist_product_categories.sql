-- Keep category records and their products synchronized, and repair categories
-- that older admin code stored only in localStorage.
create or replace function public.rename_product_category(
  category_id uuid,
  old_name text,
  new_name text,
  new_slug text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'owner') then
    raise exception 'Only owners can rename categories';
  end if;

  update public.categories
  set name = new_name, slug = new_slug
  where id = category_id and name = old_name;

  if not found then
    raise exception 'Category not found';
  end if;

  update public.products
  set category = new_name
  where category = old_name;
end;
$$;

revoke all on function public.rename_product_category(uuid, text, text, text) from public, anon;
grant execute on function public.rename_product_category(uuid, text, text, text) to authenticated;

-- Backfill any category names already used by products but missing from categories.
with missing as (
  select distinct btrim(p.category) as name
  from public.products p
  where btrim(p.category) <> ''
    and not exists (
      select 1 from public.categories c where lower(c.name) = lower(btrim(p.category))
    )
), numbered as (
  select
    name,
    coalesce((select max(sort_order) from public.categories), 0)
      + row_number() over (order by name) as sort_order
  from missing
)
insert into public.categories (name, slug, visible, sort_order)
select
  name,
  coalesce(nullif(trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')), ''), 'category')
    || '-' || substr(md5(name), 1, 8),
  true,
  sort_order
from numbered
on conflict (name) do nothing;
