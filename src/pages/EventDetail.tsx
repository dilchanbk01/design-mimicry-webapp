
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EventBookingSection } from "@/components/events/EventBookingSection";
import { EventInformation } from "@/components/events/EventInformation";
import { EventHeader } from "@/components/events/EventHeader";
import { EventImage } from "@/components/events/EventImage";
import { EventTitle } from "@/components/events/EventTitle";
import { Footer } from "@/components/layout/Footer";
import { EventSuccess } from "@/components/events/EventSuccess";
import { useEvent } from "@/hooks/useEvent";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTicketAnimation, setShowTicketAnimation] = useState(false);
  
  const { event, loading, remainingTickets, isBooked } = useEvent(id);

  // Function to send confirmation email
  const sendConfirmationEmail = async (userEmail: string, numberOfTickets: number) => {
    if (!event) return;
    
    try {
      // Call our edge function to send an email
      const response = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: userEmail,
          subject: `Your Booking Confirmation for ${event.title}`,
          bookingType: "event",
          bookingDetails: {
            title: event.title,
            date: event.date,
            location: event.location,
            tickets: numberOfTickets,
            organizer: event.organizer_name
          }
        }
      });

      console.log("Email confirmation response:", response);
    } catch (err) {
      console.error("Error sending event confirmation email:", err);
      // Don't interrupt booking flow if email fails
    }
  };

  const handleBookingComplete = async (numberOfTickets: number) => {
    setShowTicketAnimation(true);

    // Send confirmation email
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email && event) {
      await sendConfirmationEmail(user.email, numberOfTickets);
    }

    setTimeout(() => {
      setShowTicketAnimation(false);
      navigate("/profile");
    }, 3000);

    toast({
      title: "Success!",
      description: `${numberOfTickets} ticket${numberOfTickets > 1 ? 's' : ''} booked successfully!`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#00D26A] flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#00D26A] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button
            onClick={() => navigate("/events")}
            className="bg-white text-[#00D26A] hover:bg-gray-100"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00D26A] flex flex-col">
      <EventHeader />

      <main className="pt-16 flex-grow">
        <EventImage imageUrl={event.image_url} altText={event.title} />

        <div className="bg-white rounded-t-3xl -mt-6 relative z-10">
          <div className="p-6 border-b">
            <EventTitle title={event.title} />

            <EventBookingSection
              eventId={event.id}
              price={event.price}
              remainingTickets={remainingTickets}
              isBooked={isBooked}
              onBookingComplete={handleBookingComplete}
            />
          </div>

          <EventInformation event={event} />
        </div>
      </main>

      <Footer />
      <EventSuccess show={showTicketAnimation} />
    </div>
  );
}
