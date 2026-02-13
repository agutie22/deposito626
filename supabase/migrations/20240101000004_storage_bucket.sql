-- Create 'products' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Allow Public Read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow Admin Insert
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  (public.is_admin() OR auth.role() = 'service_role')
);

-- Allow Admin Update
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  (public.is_admin() OR auth.role() = 'service_role')
);

-- Allow Admin Delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  (public.is_admin() OR auth.role() = 'service_role')
);
