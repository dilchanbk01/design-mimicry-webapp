
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GroomerProfile } from "../types";
import type { GroomingPackage } from "../types/packages";

export function useGroomer(id: string | undefined) {
  const { data: groomer, isLoading: isGroomerLoading } = useQuery<GroomerProfile>({
    queryKey: ['groomer', id],
    queryFn: async () => {
      if (!id) throw new Error("Groomer ID is required");
      
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: packages = [] } = useQuery<GroomingPackage[]>({
    queryKey: ['groomer-packages', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('grooming_packages')
        .select('*')
        .eq('groomer_id', id)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  return { groomer, packages, isLoading: isGroomerLoading };
}
