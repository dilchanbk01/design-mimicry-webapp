
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useConsultation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startingConsultation, setStartingConsultation] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadVetStatus();
  }, []);

  const loadVetStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("vet_profiles")
        .select("is_online")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setIsOnline(data.is_online || false);
      }
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/vet-auth");
        return;
      }

      const { error } = await supabase
        .from("vet_profiles")
        .update({ is_online: !isOnline })
        .eq("user_id", user.id);

      if (error) throw error;
      setIsOnline(!isOnline);

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

  const handleConsultation = async (consultationId: string, action: 'accept' | 'decline') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/vet-auth");
        return;
      }

      if (action === 'accept') {
        const { error } = await supabase
          .from("consultations")
          .update({
            status: "active",
            vet_id: user.id
          })
          .eq("id", consultationId)
          .eq("status", "pending");

        if (error) throw error;

        navigate(`/consultation/${consultationId}`);
      } else {
        const { error } = await supabase
          .from("consultations")
          .update({ status: "expired" })
          .eq("id", consultationId)
          .eq("status", "pending");

        if (error) throw error;

        toast({
          title: "Consultation declined",
          description: "The consultation request has been declined",
        });
      }
    } catch (error) {
      console.error("Error handling consultation:", error);
      toast({
        title: "Error",
        description: `Failed to ${action} consultation`,
        variant: "destructive",
      });
    }
  };

  const startConsultation = async () => {
    try {
      setStartingConsultation(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: newConsultation, error: insertError } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          status: "pending"
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Finding a Veterinarian",
        description: "Please wait while we connect you with a vet...",
      });

      const channel = supabase
        .channel(`consultation-updates-${newConsultation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: `id=eq.${newConsultation.id}`,
          },
          (payload) => {
            const updatedConsultation = payload.new;
            if (updatedConsultation.status === 'active' && updatedConsultation.vet_id) {
              navigate(`/consultation/${updatedConsultation.id}`);
              supabase.removeChannel(channel);
            }
          }
        )
        .subscribe();

      // Set a timeout to check if consultation is still pending after 2 minutes
      setTimeout(async () => {
        const { data: consultation } = await supabase
          .from("consultations")
          .select("*")
          .eq("id", newConsultation.id)
          .single();

        if (consultation?.status === "pending") {
          await supabase
            .from("consultations")
            .update({ status: "expired" })
            .eq("id", newConsultation.id);

          toast({
            title: "No Vets Available",
            description: "Please try again later.",
            variant: "destructive",
          });
          setStartingConsultation(false);
          supabase.removeChannel(channel);
        }
      }, 120000);
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive",
      });
      setStartingConsultation(false);
    }
  };

  return {
    startingConsultation,
    startConsultation,
    isOnline,
    toggleAvailability,
    handleConsultation
  };
}
