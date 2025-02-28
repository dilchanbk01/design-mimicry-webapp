
import { Button } from "@/components/ui/button";

interface EventCardBookingButtonProps {
  isBooked: boolean;
}

export function EventCardBookingButton({ isBooked }: EventCardBookingButtonProps) {
  return (
    <div className="px-6 pb-6">
      <Button
        className={`w-full mt-2 ${
          isBooked
            ? "bg-green-500 hover:bg-green-600"
            : "bg-blue-900 hover:bg-blue-800"
        } text-white`}
        disabled={isBooked}
      >
        {isBooked ? "Booked" : "Book Now"}
      </Button>
    </div>
  );
}
