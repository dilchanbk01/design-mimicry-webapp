
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Instagram, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { EventBookingSection } from "@/components/events/EventBookingSection";
import { EventInformation } from "@/components/events/EventInformation";
import { EventShareMenu } from "@/components/events/EventShareMenu";
import type { Event } from "@/types/events";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingTickets, setRemainingTickets] = useState<number | null>(null);
  const [showTicketAnimation, setShowTicketAnimation] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${id}`,
        },
        () => {
          fetchRemainingTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchRemainingTickets = async () => {
    try {
      const { count, error: bookingsError } = await supabase
        .from("bookings")
        .select("*", { count: 'exact' })
        .eq("event_id", id)
        .eq("status", "confirmed");

      if (bookingsError) throw bookingsError;

      if (event) {
        setRemainingTickets(event.capacity - (count || 0));
      }
    } catch (error) {
      console.error("Error fetching remaining tickets:", error);
    }
  };

  useEffect(() => {
    async function fetchEventAndBookings() {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);
        
        const { count, error: bookingsError } = await supabase
          .from("bookings")
          .select("*", { count: 'exact', head: true })
          .eq("event_id", id)
          .eq("status", "confirmed");

        if (bookingsError) throw bookingsError;
        setRemainingTickets(eventData.capacity - (count || 0));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .eq("status", "confirmed")
            .single();

          setIsBooked(!!userBookings);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again later.",
          variant: "destructive",
        });
        navigate("/events");
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndBookings();
  }, [id, navigate, toast]);

  const handleBookingComplete = () => {
    setRemainingTickets(prev => prev !== null ? prev - 1 : null);
    setShowTicketAnimation(true);

    setTimeout(() => {
      setShowTicketAnimation(false);
      navigate("/profile");
    }, 3000);

    toast({
      title: "Success!",
      description: "Ticket booked successfully!",
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
    <div className="min-h-screen bg-[#00D26A]">
      <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="relative w-full h-64">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white rounded-t-3xl -mt-6 relative z-10">
          <div className="p-6 border-b">
            <div className="flex items-start gap-4">
              <EventShareMenu />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h1>
              </div>
            </div>

            <EventBookingSection
              eventId={event.id}
              price={event.price}
              remainingTickets={remainingTickets}
              isBooked={isBooked}
              onBookingComplete={handleBookingComplete}
            />
          </div>

          <EventInformation event={event} />

          <footer className="mt-8 p-6 bg-gray-50 rounded-b-3xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2">
                <a 
                  href="https://instagram.com/petsu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#00D26A] transition-colors flex items-center gap-2"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Follow us</span>
                </a>
              </div>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Petsu. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </main>

      {showTicketAnimation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl transform animate-[scale-in_0.5s_ease-out] flex flex-col items-center mx-4">
            <Ticket className="w-16 h-16 text-[#00D26A] animate-[bounce_1s_ease-in-out_infinite]" />
            <h2 className="text-2xl font-bold mt-4 animate-[fade-in_0.5s_ease-out]">
              Ticket Booked!
            </h2>
            <p className="text-gray-600 mt-2 text-center animate-[fade-in_0.5s_ease-out_0.2s]">
              Ticket booked successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
