-- Enforce the product image limit at the database boundary for existing projects.
create or replace function public.enforce_product_image_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Serialize image changes for a product so concurrent inserts cannot exceed the cap.
  perform pg_advisory_xact_lock(hashtext(new.product_id::text));

  if tg_op = 'INSERT' then
    if (select count(*) >= 10 from public.product_images where product_id = new.product_id) then
      raise exception 'A product can have at most 10 images';
    end if;
  elsif (
    select count(*) >= 10
    from public.product_images
    where product_id = new.product_id and id <> old.id
  ) then
    raise exception 'A product can have at most 10 images';
  end if;

  return new;
end;
$$;

drop trigger if exists product_images_limit on public.product_images;
create trigger product_images_limit
before insert or update of product_id on public.product_images
for each row execute function public.enforce_product_image_limit();
