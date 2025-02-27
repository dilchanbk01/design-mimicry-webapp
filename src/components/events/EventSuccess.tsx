
import { Ticket } from "lucide-react";

interface EventSuccessProps {
  show: boolean;
}

export function EventSuccess({ show }: EventSuccessProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl transform animate-[scale-in_0.5s_ease-out] flex flex-col items-center mx-4">
        <Ticket className="w-16 h-16 text-[#00D26A] animate-[bounce_1s_ease-in-out_infinite]" />
        <h2 className="text-2xl font-bold mt-4 animate-[fade-in_0.5s_ease-out]">
          Ticket Booked!
        </h2>
        <p className="text-gray-600 mt-2 text-center animate-[fade-in_0.5s_ease-out_0.2s]">
          Ticket booked successfully
        </p>
        <p className="text-sm text-green-600 mt-1 text-center animate-[fade-in_0.5s_ease-out_0.3s]">
          Check your email for booking confirmation
        </p>
      </div>
    </div>
  );
}
