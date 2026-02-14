-- Fix: Add security definer to create_order so anon users can place orders
-- The create_order function was recreated in the add_flavor_stock migration
-- without security definer, causing RLS to block inserts from anon users.
-- Error: 42501 "new row violates row-level security policy for table orders"

create or replace function public.create_order(
  model jsonb
) returns jsonb as $$
declare
  order_id bigint;
begin
  -- Insert Order (trigger will auto-add phone to verified_members)
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
$$ language plpgsql security definer;
