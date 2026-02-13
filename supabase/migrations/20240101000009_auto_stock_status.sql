-- Function to calculate stock status based on quantity
create or replace function public.handle_stock_status_update()
returns trigger as $$
begin
  if NEW.stock_quantity <= 0 then
    NEW.stock_status := 'out_of_stock';
  elseif NEW.stock_quantity <= 10 then
    NEW.stock_status := 'limited';
  else
    NEW.stock_status := 'in_stock';
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to run before insert or update
create trigger on_stock_change
before insert or update on products
for each row execute function public.handle_stock_status_update();

-- Force update on existing rows to ensure consistency
-- This will fire the trigger for every row
update products set stock_quantity = stock_quantity;
