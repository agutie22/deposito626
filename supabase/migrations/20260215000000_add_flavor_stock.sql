-- 1. Add flavor_stock column to products
alter table public.products 
add column if not exists flavor_stock jsonb default '{}'::jsonb;

-- 2. Update existing products: initialize flavor_stock from available_flavors if it exists
do $$
declare
    r record;
    flavor text;
    initial_flavor_stock jsonb;
begin
    for r in select id, available_flavors, stock_quantity from public.products where available_flavors is not null loop
        initial_flavor_stock := '{}'::jsonb;
        if array_length(r.available_flavors, 1) > 0 then
            foreach flavor in array r.available_flavors loop
                -- We'll assume for now flavors share the same initial default or we just leave them at 0
                -- and let the admin set them. But let's initialize them for convenience.
                initial_flavor_stock := initial_flavor_stock || jsonb_build_object(flavor, r.stock_quantity / array_length(r.available_flavors, 1));
            end loop;
            update public.products set flavor_stock = initial_flavor_stock where id = r.id;
        end if;
    end loop;
end;
$$;

-- 3. Update create_order RPC: Remove stock deduction logic
create or replace function public.create_order(
  model jsonb
) returns jsonb as $$
declare
  order_id bigint;
begin
  -- Just Insert Order, let trigger handle stock on completion
  insert into public.orders (
    customer_name,
    phone,
    address,
    total_amount,
    status,
    items
  ) values (
    model->>'customer_name',
    model->>'phone',
    model->>'address',
    (model->>'total_amount')::numeric,
    'pending',
    model->'items'
  ) returning id into order_id;

  return jsonb_build_object('id', order_id, 'status', 'success');
end;
$$ language plpgsql;

-- 4. Create function to handle stock deduction/restoration on status change
create or replace function public.process_order_stock_change()
returns trigger as $$
declare
    item jsonb;
    p_id bigint;
    p_quantity int;
    p_flavor text;
    current_flavor_stock jsonb;
begin
    -- Case: Mark as Completed (Deduct Stock)
    if NEW.status = 'completed' and OLD.status != 'completed' then
        for item in select * from jsonb_array_elements(NEW.items) loop
            p_id := (item->>'id')::bigint;
            p_quantity := (item->>'quantity')::int;
            p_flavor := item->>'flavor';

            -- Lock product for update
            select flavor_stock from public.products where id = p_id for update into current_flavor_stock;
            
            if not found then continue; end if;

            if p_flavor is not null and current_flavor_stock ? p_flavor then
                -- Deduct flavored stock
                update public.products 
                set 
                    flavor_stock = jsonb_set(
                        flavor_stock, 
                        array[p_flavor], 
                        to_jsonb(greatest(0, (flavor_stock->>p_flavor)::int - p_quantity))
                    ),
                    stock_quantity = greatest(0, stock_quantity - p_quantity)
                where id = p_id;
            else
                -- Deduct overall stock
                update public.products 
                set stock_quantity = greatest(0, stock_quantity - p_quantity)
                where id = p_id;
            end if;
        end loop;

    -- Case: Revert from Completed to anything else (Restore Stock)
    elsif OLD.status = 'completed' and NEW.status != 'completed' then
        for item in select * from jsonb_array_elements(OLD.items) loop
            p_id := (item->>'id')::bigint;
            p_quantity := (item->>'quantity')::int;
            p_flavor := item->>'flavor';

            -- Lock product for update
            select flavor_stock from public.products where id = p_id for update into current_flavor_stock;
            
            if not found then continue; end if;

            if p_flavor is not null and current_flavor_stock ? p_flavor then
                -- Restore flavored stock
                update public.products 
                set 
                    flavor_stock = jsonb_set(
                        flavor_stock, 
                        array[p_flavor], 
                        to_jsonb((flavor_stock->>p_flavor)::int + p_quantity)
                    ),
                    stock_quantity = stock_quantity + p_quantity
                where id = p_id;
            else
                -- Restore overall stock
                update public.products 
                set stock_quantity = stock_quantity + p_quantity
                where id = p_id;
            end if;
        end loop;
    end if;

    return NEW;
end;
$$ language plpgsql;

-- 5. Create the trigger on orders
drop trigger if exists tr_order_stock_sync on public.orders;
create trigger tr_order_stock_sync
after update on public.orders
for each row
execute function public.process_order_stock_change();

-- 6. Update handle_stock_status_update function to be more robust
-- (Already exists, but ensuring it correctly reflects stock_status whenever stock_quantity changes)
create or replace function public.handle_stock_status_update()
returns trigger as $$
begin
  if NEW.stock_quantity <= 0 then
    NEW.stock_status := 'out_of_stock';
  elsif NEW.stock_quantity <= 10 then
    NEW.stock_status := 'limited';
  else
    NEW.stock_status := 'in_stock';
  end if;
  return NEW;
end;
$$ language plpgsql;
