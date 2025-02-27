
-- Function to fetch packages for a specific groomer
CREATE OR REPLACE FUNCTION public.fetch_groomer_packages(groomer_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  groomer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT gp.id, gp.name, gp.description, gp.price, gp.groomer_id, gp.created_at
  FROM public.grooming_packages gp
  WHERE gp.groomer_id = groomer_id_param
  ORDER BY gp.created_at DESC;
END;
$$;

-- Function to add a new grooming package
CREATE OR REPLACE FUNCTION public.add_grooming_package(
  name_param TEXT,
  description_param TEXT,
  price_param NUMERIC,
  groomer_id_param UUID
) 
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.grooming_packages (name, description, price, groomer_id)
  VALUES (name_param, description_param, price_param, groomer_id_param)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;
