
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  duration: number;
  location: string;
  price: number;
  capacity: number;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setEvent(data);
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

    fetchEvent();
  }, [id, navigate, toast]);

  const handleBooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this event.",
        variant: "destructive",
      });
      return;
    }

    setBookingInProgress(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .insert([{ event_id: id, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your booking has been confirmed.",
      });
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
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button
            onClick={() => navigate("/events")}
            className="bg-white text-accent hover:bg-gray-100"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          onClick={() => navigate("/events")}
          variant="outline"
          className="mb-6 bg-white"
        >
          Back to Events
        </Button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-accent mb-4">{event.title}</h1>
            <p className="text-gray-600 mb-6">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>{format(new Date(event.date), "PPP")}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  <span>{event.duration} minutes</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3" />
                  <span>{event.capacity} spots available</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-2xl font-bold text-accent">${event.price}</div>
              <Button
                onClick={handleBooking}
                disabled={bookingInProgress}
                className="bg-accent text-white hover:bg-accent/90"
              >
                {bookingInProgress ? "Booking..." : "Book Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
