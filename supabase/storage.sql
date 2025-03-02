
-- Create storage bucket for banners if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for groomer profiles if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('groomer-profiles', 'groomer-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to banner images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' )
ON CONFLICT DO NOTHING;

-- Allow public access to groomer profile images
CREATE POLICY "Public Access to Groomer Profiles"
ON storage.objects FOR SELECT
USING ( bucket_id = 'groomer-profiles' )
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload banners
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners'
  AND auth.role() = 'authenticated'
)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload groomer profile images
CREATE POLICY "Authenticated users can upload groomer profiles"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'groomer-profiles'
  AND auth.role() = 'authenticated'
)
ON CONFLICT DO NOTHING;
