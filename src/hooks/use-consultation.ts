
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

  const handleConsultation = async (consultationId: string, action: 'accept' | 'decline') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/vet-auth");
        return;
      }

      // First check if the vet is online and the consultation is still pending
      const { data: vetProfile } = await supabase
        .from("vet_profiles")
        .select("is_online")
        .eq("user_id", user.id)
        .single();

      if (!vetProfile?.is_online && action === 'accept') {
        toast({
          title: "Error",
          description: "You must be online to accept consultations",
          variant: "destructive",
        });
        return;
      }

      if (action === 'accept') {
        const { data: consultation, error } = await supabase
          .from("consultations")
          .update({
            status: "active",
            vet_id: user.id
          })
          .eq("id", consultationId)
          .eq("status", "pending")
          .select()
          .single();

        if (error) throw error;
        if (!consultation) {
          toast({
            title: "Error",
            description: "This consultation is no longer available",
            variant: "destructive",
          });
          return;
        }

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

      // Check if there are any online vets before creating consultation
      const { data: onlineVets, error: vetsError } = await supabase
        .from("vet_profiles")
        .select("id")
        .eq("is_online", true)
        .eq("application_status", "approved");

      if (vetsError) throw vetsError;

      if (!onlineVets?.length) {
        toast({
          title: "No Vets Available",
          description: "Please try again later when vets are online.",
          variant: "destructive",
        });
        setStartingConsultation(false);
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
      }, 120000); // 2 minutes timeout
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

  const endConsultation = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({
          status: "completed",
          ended_at: new Date().toISOString()
        })
        .eq("id", consultationId)
        .eq("status", "active");

      if (error) throw error;

      toast({
        title: "Consultation Ended",
        description: "Thank you for using our service!",
      });

      navigate("/");
    } catch (error) {
      console.error("Error ending consultation:", error);
      toast({
        title: "Error",
        description: "Failed to end consultation",
        variant: "destructive",
      });
    }
  };

  return {
    startingConsultation,
    startConsultation,
    isOnline,
    toggleAvailability,
    handleConsultation,
    endConsultation
  };
}
