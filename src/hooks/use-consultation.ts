
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useConsultation() {
  const [isOnline, setIsOnline] = useState(false);
  const [startingConsultation, setStartingConsultation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to change your availability",
          variant: "destructive",
        });
        return;
      }

      const newStatus = !isOnline;
      
      const { error } = await supabase
        .from('vet_profiles')
        .update({ is_online: newStatus })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsOnline(newStatus);
      
      toast({
        title: newStatus ? "You're Online" : "You're Offline",
        description: newStatus 
          ? "You are now visible to pet owners and can receive consultations." 
          : "You are now invisible to pet owners and won't receive new consultations.",
      });
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Error",
        description: "Failed to update your availability status",
        variant: "destructive",
      });
    }
  };

  const startConsultation = async () => {
    try {
      setStartingConsultation(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to start a consultation",
          variant: "destructive",
        });
        return;
      }

      // Create a new consultation
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Consultation Started",
        description: "Waiting for a veterinarian to join...",
      });

      // Navigate to the consultation chat
      navigate(`/consultation/${data.id}`);
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive",
      });
    } finally {
      setStartingConsultation(false);
    }
  };

  const handleConsultation = async (consultationId: string, action: 'accept' | 'decline') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to handle consultations",
          variant: "destructive",
        });
        return;
      }

      if (action === 'accept') {
        // Update the consultation with the vet's ID and change status to active
        const { error } = await supabase
          .from('consultations')
          .update({ 
            vet_id: user.id,
            status: 'active'
          })
          .eq('id', consultationId);

        if (error) throw error;

        // Navigate to the consultation chat
        navigate(`/consultation/${consultationId}`);
      } else {
        // Just decline the consultation (could implement logic to assign to another vet)
        const { error } = await supabase
          .from('consultations')
          .update({ status: 'declined' })
          .eq('id', consultationId);

        if (error) throw error;

        toast({
          title: "Consultation Declined",
          description: "You have declined this consultation request.",
        });
      }
    } catch (error) {
      console.error("Error handling consultation:", error);
      toast({
        title: "Error",
        description: "Failed to handle consultation request",
        variant: "destructive",
      });
    }
  };

  return {
    isOnline,
    toggleAvailability,
    startingConsultation,
    startConsultation,
    handleConsultation
  };
}
