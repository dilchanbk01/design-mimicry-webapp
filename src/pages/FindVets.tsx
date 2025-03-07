
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";
import { VetCard } from "@/components/find-vets/VetCard";
import { ConsultationButton } from "@/components/find-vets/ConsultationButton";
import { useConsultation } from "@/hooks/use-consultation";
import type { VetProfile } from "@/types/vet";

export default function FindVets() {
  const { toast } = useToast();
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { startingConsultation, startConsultation } = useConsultation();

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
      
      // Ensure each vet profile has the is_online field
      const vetsWithOnlineStatus = (data || []).map(vet => ({
        ...vet,
        is_online: vet.is_online ?? false
      }));
      
      setVets(vetsWithOnlineStatus);
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
          <p className="mb-6 text-gray-600">
            Start a consultation with our online veterinarians or browse our directory.
          </p>
          <ConsultationButton
            onStartConsultation={startConsultation}
            isStarting={startingConsultation}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vets.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-100 rounded-lg">
              <Stethoscope className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No veterinarians are available at the moment.</p>
              <p className="text-gray-500 mt-2">Please check back later or start a general consultation.</p>
            </div>
          ) : (
            vets.map((vet) => (
              <VetCard key={vet.id} vet={vet} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
