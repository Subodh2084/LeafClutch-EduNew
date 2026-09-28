-- 17/17 · Brand spelling: "LeafClutch" → "Leafclutch" in all stored text.
-- Updates every text column of every table in the public schema, only where
-- the old spelling appears. Safe to run again: afterwards nothing matches.

do $$
declare
  col record;
begin
  for col in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.data_type in ('text', 'character varying')
  loop
    execute format(
      'update public.%I set %I = replace(%I, %L, %L) where %I like %L',
      col.table_name, col.column_name, col.column_name, 'LeafClutch', 'Leafclutch', col.column_name, '%LeafClutch%'
    );
  end loop;
end;
$$;
