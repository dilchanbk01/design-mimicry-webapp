
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useVetStatus() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadVetStatus();
  }, []);

  const loadVetStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("vet_profiles")
          .select("is_online")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setIsOnline(!!data.is_online);
        }
      }
    } catch (error) {
      console.error("Error loading vet status:", error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/vet-auth");
        return;
      }

      const { data, error } = await supabase
        .from("vet_profiles")
        .update({ is_online: !isOnline })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setIsOnline(!!data.is_online);
      }

      toast({
        title: !isOnline ? "You are now online" : "You are now offline",
        description: !isOnline ? "You can now receive consultation requests" : "You won't receive any consultation requests",
      });
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  };

  return {
    isOnline,
    toggleAvailability,
  };
}
