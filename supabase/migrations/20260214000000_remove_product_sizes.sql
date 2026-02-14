-- Remove available_sizes column from products table
ALTER TABLE products DROP COLUMN IF EXISTS available_sizes;
