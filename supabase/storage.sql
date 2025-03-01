

-- Create storage bucket for banners if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to banner images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' );

-- Allow authenticated users to upload banners
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners'
  AND auth.role() = 'authenticated'
);

-- Create storage bucket for groomer profiles if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('groomer-profiles', 'groomer-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to groomer profile images
CREATE POLICY "Public Access to Groomer Profiles"
ON storage.objects FOR SELECT
USING ( bucket_id = 'groomer-profiles' );

-- Allow authenticated users to upload groomer profile images
CREATE POLICY "Authenticated users can upload groomer profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'groomer-profiles'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own groomer profile images
CREATE POLICY "Users can update their own groomer profile images"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'groomer-profiles'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own groomer profile images
CREATE POLICY "Users can delete their own groomer profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'groomer-profiles'
  AND auth.role() = 'authenticated'
);
