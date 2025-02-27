
import { Button } from "@/components/ui/button";

interface BookAppointmentButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isProcessing: boolean;
}

export function BookAppointmentButton({ onClick, isProcessing }: BookAppointmentButtonProps) {
  return (
    <Button
      className="w-full bg-green-500 hover:bg-green-600 text-white shadow-md"
      onClick={onClick}
      disabled={isProcessing}
    >
      {isProcessing ? "Processing..." : "Book Now"}
    </Button>
  );
}
