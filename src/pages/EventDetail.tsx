
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, Mail, Phone, Globe, PawPrint, Ticket } from "lucide-react";
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
  event_type: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  organizer_website: string;
  pet_types: string;
  pet_requirements: string;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [remainingTickets, setRemainingTickets] = useState<number | null>(null);

  useEffect(() => {
    async function fetchEventAndBookings() {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) throw eventError;

        // Get total bookings for this event
        const { count, error: bookingsError } = await supabase
          .from("bookings")
          .select("*", { count: 'exact' })
          .eq("event_id", id)
          .eq("status", "confirmed");

        if (bookingsError) throw bookingsError;

        setEvent(eventData);
        setRemainingTickets(eventData.capacity - (count || 0));
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

  const handleBooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this event.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (remainingTickets === 0) {
      toast({
        title: "Event Full",
        description: "Sorry, this event is fully booked.",
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

      // Update remaining tickets count
      setRemainingTickets(prev => prev !== null ? prev - 1 : null);

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
    <div className="min-h-screen bg-[#00D26A] py-12 px-4">
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

          {/* Booking Section - Moved to top */}
          <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-[#00D26A]">
                  ${event.price}
                </span>
                <span className="text-gray-500 ml-2">per ticket</span>
                <div className="mt-2 flex items-center text-sm">
                  <Ticket className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    {remainingTickets !== null ? `${remainingTickets} tickets remaining` : 'Loading...'}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleBooking}
                disabled={bookingInProgress || remainingTickets === 0}
                className="bg-[#00D26A] hover:bg-[#00D26A]/90 text-white px-8"
              >
                {bookingInProgress ? "Processing..." : remainingTickets === 0 ? "Sold Out" : "Book Now"}
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {event.event_type}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>
            <p className="text-gray-600 mb-8">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Event Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Event Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3" />
                    <span>{format(new Date(event.date), "PPP")}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3" />
                    <span>{format(new Date(event.date), "p")}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3" />
                    <span>Capacity: {event.capacity} people</span>
                  </div>
                </div>
              </div>

              {/* Organizer Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Organizer Details</h2>
                <div className="space-y-3">
                  <div className="text-gray-600">
                    <strong className="block">Organized by:</strong>
                    <span>{event.organizer_name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-5 h-5 mr-3" />
                    <a href={`mailto:${event.organizer_email}`} className="text-blue-600 hover:underline">
                      {event.organizer_email}
                    </a>
                  </div>
                  {event.organizer_phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3" />
                      <a href={`tel:${event.organizer_phone}`} className="text-blue-600 hover:underline">
                        {event.organizer_phone}
                      </a>
                    </div>
                  )}
                  {event.organizer_website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-5 h-5 mr-3" />
                      <a href={event.organizer_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pet Information */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <div className="flex items-center">
                  <PawPrint className="w-6 h-6 mr-2" />
                  Pet Information
                </div>
              </h2>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-700">Allowed Pets:</strong>
                  <span className="ml-2 text-gray-600">{event.pet_types}</span>
                </div>
                {event.pet_requirements && (
                  <div>
                    <strong className="text-gray-700">Special Requirements:</strong>
                    <p className="mt-1 text-gray-600">{event.pet_requirements}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
