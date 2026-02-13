-- Fix RLS Policies for Public Read
-- Re-enable public read access on products (if missing)
drop policy if exists "Enable read access for all users" on products;
create policy "Enable read access for all users" on products for select using (true);

-- Re-enable public read access on store_settings (if missing)
drop policy if exists "Enable read access for all users" on store_settings;
create policy "Enable read access for all users" on store_settings for select using (true);
