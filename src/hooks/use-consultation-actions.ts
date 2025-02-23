
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useConsultationActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConsultation = async (consultationId: string, action: 'accept' | 'decline') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/vet-auth");
        return;
      }

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
    handleConsultation,
    endConsultation,
  };
}
