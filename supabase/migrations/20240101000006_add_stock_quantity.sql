-- Add stock_quantity column to products
alter table products 
add column if not exists stock_quantity integer not null default 100;

-- Ensure Admins can update this column (covered by existing policy, but good to double check if we had column specific policies, which we don't)
