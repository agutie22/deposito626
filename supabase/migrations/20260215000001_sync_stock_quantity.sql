-- Trigger function to synchronize total stock_quantity with the sum of flavored stocks
create or replace function public.sync_product_total_stock()
returns trigger as $$
declare
    total_flavor_stock int := 0;
    flavor_val record;
begin
    -- Only sync if flavor_stock is not empty
    if NEW.flavor_stock is not null and NEW.flavor_stock != '{}'::jsonb then
        -- Calculate sum of all values in the jsonb object
        select sum(value::int) into total_flavor_stock
        from jsonb_each_text(NEW.flavor_stock);
        
        -- Update the stock_quantity to match the sum
        NEW.stock_quantity := coalesce(total_flavor_stock, 0);
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- Apply trigger to products table
drop trigger if exists tr_sync_total_stock on public.products;
create trigger tr_sync_total_stock
before insert or update of flavor_stock on public.products
for each row
execute function public.sync_product_total_stock();

-- Force a sync for existing flavored products
update public.products 
set flavor_stock = flavor_stock 
where flavor_stock is not null and flavor_stock != '{}'::jsonb;
