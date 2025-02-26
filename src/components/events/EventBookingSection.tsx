import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Ticket, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
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

  const baseAmount = price * numberOfTickets;
  const gstAmount = price > 0 ? (baseAmount * 0.18) : 0;
  const totalAmount = baseAmount + gstAmount;

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

    if (price === 0) {
      try {
        setBookingInProgress(true);
        const bookings = Array(numberOfTickets).fill(null).map(() => ({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed'
        }));

        const { error } = await supabase
          .from("bookings")
          .insert(bookings);

        if (error) throw error;
        onBookingComplete();
        toast({
          title: "Success",
          description: "Your free event has been booked successfully!",
        });
      } catch (error) {
        console.error("Error booking free event:", error);
        toast({
          title: "Booking Failed",
          description: "Unable to complete your booking. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setBookingInProgress(false);
      }
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      toast({
        title: "Error",
        description: "Payment system failed to load",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {price === 0 ? (
              <span className="text-2xl font-bold text-[#00D26A]">FREE</span>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Base Price</span>
                  <span className="text-2xl font-bold text-[#00D26A]">₹{price}</span>
                  <span className="text-sm text-gray-500">per ticket</span>
                </div>
                {numberOfTickets > 1 && (
                  <div className="flex flex-col ml-4">
                    <span className="text-sm text-gray-500">Total ({numberOfTickets} tickets)</span>
                    <span className="text-2xl font-bold text-[#00D26A]">₹{totalAmount}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 p-0 h-auto hover:text-gray-700"
                      onClick={() => setShowPriceBreakdown(true)}
                    >
                      View breakdown
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
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
      
      <Button
        onClick={handlePayment}
        disabled={bookingInProgress || remainingTickets === 0 || isBooked}
        className={`w-full ${
          isBooked
            ? "bg-green-500 hover:bg-green-600"
            : "bg-[#00D26A] hover:bg-[#00D26A]/90"
        } text-white`}
      >
        {bookingInProgress ? "Processing..." : isBooked ? "Booked" : 
         remainingTickets === 0 ? "Sold Out" : 
         price === 0 ? "Book Now (Free)" : "Book Now"}
      </Button>

      <Dialog open={showPriceBreakdown} onOpenChange={setShowPriceBreakdown}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price Breakdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Base Price ({numberOfTickets} tickets)</span>
              <span>₹{baseAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
