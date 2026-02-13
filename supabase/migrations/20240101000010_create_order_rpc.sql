create or replace function public.create_order(
  model jsonb
) returns jsonb as $$
declare
  order_id bigint;
  item jsonb;
  product_record record;
  new_stock int;
begin
  -- 1. Insert Order
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

  -- 2. Process Items and specific Stock
  for item in select * from jsonb_array_elements(model->'items')
  loop
    -- Lock the product row for update to prevent race conditions
    select * from products where id = (item->>'id')::bigint for update into product_record;
    
    if not found then
      raise exception 'Product % not found', (item->>'name');
    end if;

    -- Check stock
    if product_record.stock_quantity < (item->>'quantity')::int then
      raise exception 'Insufficient stock for product: % (Available: %, Requested: %)', 
        product_record.name, product_record.stock_quantity, (item->>'quantity');
    end if;

    -- Deduct stock
    update products 
    set stock_quantity = stock_quantity - (item->>'quantity')::int
    where id = (item->>'id')::bigint;
    
    -- Trigger will auto-update stock_status
  end loop;

  return jsonb_build_object('id', order_id, 'status', 'success');
end;
$$ language plpgsql;
