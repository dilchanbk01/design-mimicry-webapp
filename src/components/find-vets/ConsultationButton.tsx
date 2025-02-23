
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Stethoscope, Clock } from "lucide-react";

interface ConsultationButtonProps {
  onStartConsultation: () => Promise<void>;
  isStarting: boolean;
}

export function ConsultationButton({ 
  onStartConsultation, 
  isStarting 
}: ConsultationButtonProps) {
  return (
    <Button
      size="lg"
      onClick={onStartConsultation}
      disabled={isStarting}
      className="bg-primary hover:bg-primary/90"
    >
      {isStarting ? (
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
  );
}
