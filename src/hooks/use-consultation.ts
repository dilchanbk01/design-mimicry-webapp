
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useConsultation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startingConsultation, setStartingConsultation] = useState(false);

  const startConsultation = async () => {
    try {
      setStartingConsultation(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { error: insertError } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          status: "pending"
        });

      if (insertError) throw insertError;

      toast({
        title: "Finding a Veterinarian",
        description: "Please wait while we connect you with a vet...",
      });

      const channel = supabase
        .channel('consultation-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            const consultation = payload.new;
            if (consultation.status === 'active' && consultation.vet_id) {
              navigate(`/consultation/${consultation.id}`);
            }
          }
        )
        .subscribe();

      setTimeout(async () => {
        const { data: pendingConsultations } = await supabase
          .from("consultations")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .limit(1);

        if (pendingConsultations && pendingConsultations.length > 0) {
          await supabase
            .from("consultations")
            .update({ status: "expired" })
            .eq("id", pendingConsultations[0].id);

          toast({
            title: "No Vets Available",
            description: "Please try again later.",
            variant: "destructive",
          });
          setStartingConsultation(false);
        }

        supabase.removeChannel(channel);
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
    startConsultation
  };
}
