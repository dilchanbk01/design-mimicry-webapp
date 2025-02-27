
import { Check } from "lucide-react";

interface BookingConfirmationProps {
  show: boolean;
  groomerName: string;
  bookingDate: string;
  bookingTime: string;
}

export function BookingConfirmation({ show, groomerName, bookingDate, bookingTime }: BookingConfirmationProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-xl animate-scale-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-gray-600">
            Your appointment with {groomerName} has been successfully booked for {new Date(bookingDate).toLocaleDateString()} at {bookingTime}.
          </p>
          <p className="text-sm text-gray-500">
            You can view your appointment details in your profile.
          </p>
          <p className="text-sm text-green-600">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
