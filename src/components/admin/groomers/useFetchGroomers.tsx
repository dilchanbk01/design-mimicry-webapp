
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { GroomerProfile } from "@/components/admin/groomers/types";

export const useFetchGroomers = () => {
  const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGroomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching groomer profiles...");
      
      const { data, error } = await supabase
        .from("groomer_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching groomers:", error);
        setError(error.message);
        toast({
          title: "Error fetching groomers",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Groomer profiles fetched:", data);
      
      if (data) {
        setGroomers(data as GroomerProfile[]);
      }
    } catch (err: any) {
      console.error("Exception fetching groomers:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch groomer profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroomers();
    
    // Set up a real-time subscription for new groomer profiles
    const channel = supabase
      .channel('groomer_profiles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groomer_profiles' },
        () => {
          console.log('Groomer profiles changed, refreshing data...');
          fetchGroomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshGroomers = () => {
    fetchGroomers();
  };

  return { groomers, loading, error, refreshGroomers };
};
