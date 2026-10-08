-- Rename the public categories and keep existing product assignments aligned.
do $$
declare
  rename_pair text[];
begin
  foreach rename_pair slice 1 in array array[
    array['Tables', 'Centre Tables', 'centre-tables'],
    array['Mirrors', 'Dressing Table', 'dressing-table'],
    array['Shoe Racks & Storage', 'Showcase', 'showcase']
  ]
  loop
    if exists (select 1 from public.categories where name = rename_pair[2]) then
      update public.products set category = rename_pair[2] where category = rename_pair[1];
      delete from public.categories where name = rename_pair[1];
    else
      update public.categories
      set name = rename_pair[2], slug = rename_pair[3]
      where name = rename_pair[1];
      update public.products set category = rename_pair[2] where category = rename_pair[1];
    end if;
  end loop;
end;
$$;

insert into public.categories (name, slug, visible, sort_order)
values ('Mattresses', 'mattresses', true, 7)
on conflict (name) do update set slug = excluded.slug;

insert into public.categories (name, slug, visible, sort_order)
values ('Bed Set', 'bed-set', true, 10)
on conflict (name) do update set slug = excluded.slug;

update public.categories
set sort_order = case name
  when 'Wedding Sets' then 1
  when 'Wardrobes' then 2
  when 'Sofas' then 3
  when 'Centre Tables' then 4
  when 'Dining' then 5
  when 'Beds' then 6
  when 'Mattresses' then 7
  when 'Dressing Table' then 8
  when 'Showcase' then 9
  when 'Bed Set' then 10
  else sort_order + 20
end;
