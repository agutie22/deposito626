-- Add new columns to orders table
alter table orders
add column if not exists phone text,
add column if not exists address text,
add column if not exists items jsonb;

-- Enable insert for anon users (customers)
create policy "Enable insert for anon users" on orders
  for insert with check (true);

-- Ensure anon users can't read/update/delete orders (only insert)
-- Existing policies already restrict select/update/delete to admins, so we are good.
