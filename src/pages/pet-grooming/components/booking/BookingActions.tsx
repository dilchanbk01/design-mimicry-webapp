
import { Button } from "@/components/ui/button";

interface BookingActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function BookingActions({ onCancel, onConfirm, isProcessing }: BookingActionsProps) {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isProcessing}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isProcessing}
        className="bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? "Processing..." : "Confirm Booking"}
      </Button>
    </div>
  );
}
