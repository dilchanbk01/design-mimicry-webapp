
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";

interface BookAppointmentButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

export function BookAppointmentButton({ onClick, isProcessing }: BookAppointmentButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="w-full md:w-64 bg-green-600 hover:bg-green-700"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
        </>
      )}
    </Button>
  );
}
