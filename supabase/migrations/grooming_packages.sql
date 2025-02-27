
CREATE TABLE IF NOT EXISTS public.grooming_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groomer_id UUID NOT NULL REFERENCES public.groomer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for grooming packages
ALTER TABLE public.grooming_packages ENABLE ROW LEVEL SECURITY;

-- Groomers can view and manage their own packages
CREATE POLICY "Groomers can view their own packages" 
  ON public.grooming_packages 
  FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM groomer_profiles WHERE id = grooming_packages.groomer_id
  ));

CREATE POLICY "Groomers can insert their own packages" 
  ON public.grooming_packages 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM groomer_profiles WHERE id = grooming_packages.groomer_id
  ));

CREATE POLICY "Groomers can update their own packages" 
  ON public.grooming_packages 
  FOR UPDATE 
  USING (auth.uid() IN (
    SELECT user_id FROM groomer_profiles WHERE id = grooming_packages.groomer_id
  ));

CREATE POLICY "Groomers can delete their own packages" 
  ON public.grooming_packages 
  FOR DELETE 
  USING (auth.uid() IN (
    SELECT user_id FROM groomer_profiles WHERE id = grooming_packages.groomer_id
  ));

-- Customers can view all packages
CREATE POLICY "Customers can view all packages" 
  ON public.grooming_packages 
  FOR SELECT 
  TO public
  USING (true);
