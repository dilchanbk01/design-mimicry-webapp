
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Stethoscope, Star, Clock } from "lucide-react";

interface VetProfile {
  id: string;
  clinic_name: string;
  specializations: string[];
  years_of_experience: number;
  bio: string | null;
}

export default function FindVets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingConsultation, setStartingConsultation] = useState(false);

  useEffect(() => {
    loadApprovedVets();
  }, []);

  const loadApprovedVets = async () => {
    try {
      const { data, error } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("application_status", "approved");

      if (error) throw error;
      setVets(data || []);
    } catch (error) {
      console.error("Error loading vets:", error);
      toast({
        title: "Error",
        description: "Failed to load veterinarians",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

      // Create a new consultation request
      const { data: consultation, error } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // Show waiting message
      toast({
        title: "Finding a Veterinarian",
        description: "Please wait while we connect you with a vet...",
      });

      // Subscribe to status changes
      const channel = supabase
        .channel(`consultation_${consultation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: `id=eq.${consultation.id}`,
          },
          (payload) => {
            if (payload.new.status === 'active' && payload.new.vet_id) {
              // Redirect to chat when a vet accepts
              navigate(`/consultation/${consultation.id}`);
            }
          }
        )
        .subscribe();

      // Set a timeout to handle no vet accepting
      setTimeout(async () => {
        const { data: currentConsultation } = await supabase
          .from("consultations")
          .select("status")
          .eq("id", consultation.id)
          .single();

        if (currentConsultation?.status === "pending") {
          await supabase
            .from("consultations")
            .update({ status: "expired" })
            .eq("id", consultation.id);

          toast({
            title: "No Vets Available",
            description: "Please try again later.",
            variant: "destructive",
          });
          setStartingConsultation(false);
        }

        supabase.removeChannel(channel);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <Stethoscope className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Available Veterinarians</h1>
          <Button
            size="lg"
            onClick={startConsultation}
            disabled={startingConsultation}
            className="bg-primary hover:bg-primary/90"
          >
            {startingConsultation ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Finding a Vet...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-5 w-5" />
                Start Instant Consultation
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vets.map((vet) => (
            <div
              key={vet.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{vet.clinic_name}</h2>
                  <p className="text-sm text-gray-500">
                    {vet.years_of_experience} years of experience
                  </p>
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 text-sm">Available</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {vet.specializations?.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {vet.bio && (
                <p className="text-sm text-gray-600 line-clamp-3">{vet.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
