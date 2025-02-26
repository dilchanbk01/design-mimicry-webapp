
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface EventBookingSectionProps {
  eventId: string;
  price: number;
  remainingTickets: number | null;
  isBooked: boolean;
  onBookingComplete: () => void;
}

export function EventBookingSection({
  eventId,
  price,
  remainingTickets,
  isBooked,
  onBookingComplete,
}: EventBookingSectionProps) {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const adjustTickets = (increment: boolean) => {
    if (increment && remainingTickets && numberOfTickets < remainingTickets) {
      setNumberOfTickets(prev => prev + 1);
    } else if (!increment && numberOfTickets > 1) {
      setNumberOfTickets(prev => prev - 1);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      localStorage.setItem('redirectAfterAuth', location.pathname);
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this event.",
      });
      navigate("/auth");
      return;
    }

    if (!remainingTickets || remainingTickets < numberOfTickets) {
      toast({
        title: "Not Enough Tickets",
        description: "Sorry, there aren't enough tickets available.",
        variant: "destructive",
      });
      return;
    }

    const res = await loadRazorpayScript();

    if (!res) {
      toast({
        title: "Error",
        description: "Razorpay SDK failed to load",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = price * numberOfTickets;

    const options = {
      key: "rzp_test_5wYJG4Y7jeVhsz",
      amount: totalAmount * 100,
      currency: "INR",
      name: "Petsu",
      description: `Booking for event`,
      image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
      handler: async function (response: any) {
        try {
          setBookingInProgress(true);
          const bookings = Array(numberOfTickets).fill(null).map(() => ({
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed',
            payment_id: response.razorpay_payment_id
          }));

          const { error } = await supabase
            .from("bookings")
            .insert(bookings);

          if (error) throw error;
          onBookingComplete();

        } catch (error) {
          console.error("Error booking event:", error);
          toast({
            title: "Booking Failed",
            description: "Unable to complete your booking. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setBookingInProgress(false);
        }
      },
      prefill: {
        email: user.email,
        contact: "",
      },
      theme: {
        color: "#00D26A",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-2xl font-bold text-[#00D26A]">
            ₹{price}
          </span>
          <span className="text-gray-500 ml-2">per ticket</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center text-sm mb-2">
            <Ticket className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">
              {remainingTickets !== null ? `${remainingTickets} remaining` : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1">
            <Button
              size="icon"
              variant="outline"
              onClick={() => adjustTickets(false)}
              disabled={numberOfTickets <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{numberOfTickets}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => adjustTickets(true)}
              disabled={!remainingTickets || numberOfTickets >= remainingTickets}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Total: ₹{(price * numberOfTickets).toFixed(2)}
      </p>
      <Button
        onClick={handlePayment}
        disabled={bookingInProgress || remainingTickets === 0 || isBooked}
        className={`w-full ${
          isBooked
            ? "bg-green-500 hover:bg-green-600"
            : "bg-[#00D26A] hover:bg-[#00D26A]/90"
        } text-white`}
      >
        {bookingInProgress ? "Processing..." : isBooked ? "Booked" : remainingTickets === 0 ? "Sold Out" : "Book Now"}
      </Button>
    </div>
  );
}
