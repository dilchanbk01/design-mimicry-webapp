import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, Mail, Phone, Globe, PawPrint, Ticket, Minus, Plus, ArrowLeft, Instagram } from "lucide-react";
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
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [showTicketAnimation, setShowTicketAnimation] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

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

        // Check if the current user has booked this event
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userBookings } = await supabase
            .from("bookings")
            .select("*")
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

    if (!remainingTickets || remainingTickets < numberOfTickets) {
      toast({
        title: "Not Enough Tickets",
        description: "Sorry, there aren't enough tickets available.",
        variant: "destructive",
      });
      return;
    }

    setBookingInProgress(true);
    try {
      // Create multiple booking entries based on number of tickets
      const bookings = Array(numberOfTickets).fill({
        event_id: id,
        user_id: user.id,
        status: 'confirmed'
      });

      const { error } = await supabase
        .from("bookings")
        .insert(bookings);

      if (error) throw error;

      // Update remaining tickets count
      setRemainingTickets(prev => prev !== null ? prev - numberOfTickets : null);
      
      // Show ticket animation
      setShowTicketAnimation(true);

      // Hide animation after 3 seconds and navigate to profile
      setTimeout(() => {
        setShowTicketAnimation(false);
        navigate("/profile");
      }, 3000);

      toast({
        title: "Success!",
        description: `${numberOfTickets} ticket${numberOfTickets > 1 ? 's' : ''} booked successfully!`,
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

  const adjustTickets = (increment: boolean) => {
    if (increment && remainingTickets && numberOfTickets < remainingTickets) {
      setNumberOfTickets(prev => prev + 1);
    } else if (!increment && numberOfTickets > 1) {
      setNumberOfTickets(prev => prev - 1);
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
    <div className="min-h-screen bg-[#00D26A]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate("/events")}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-20 cursor-pointer"
              onClick={() => navigate('/')}
            />
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="loading-spinner" />
          </div>
        ) : !event ? (
          <div className="min-h-screen flex items-center justify-center">
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
        ) : (
          <div className="pb-20">
            {/* Event Image */}
            <div className="relative w-full h-64">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Content */}
            <div className="bg-white rounded-t-3xl -mt-6 relative z-10">
              {/* Booking Section */}
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h1>
                <div className="bg-blue-50 rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-2xl font-bold text-[#00D26A]">
                        ₹{event.price}
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
                    Total: ₹{(event.price * numberOfTickets).toFixed(2)}
                  </p>
                  <Button
                    onClick={handleBooking}
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
              </div>

              {/* Event Details */}
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">{event.description}</p>
                    <div className="grid gap-3 text-sm">
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
                </div>

                {/* Pet Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <PawPrint className="w-6 h-6 mr-2" />
                    Pet Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-gray-700">Allowed Pets:</strong>
                      <span className="ml-2 text-gray-600">{event.pet_types}</span>
                    </div>
                    {event.pet_requirements && (
                      <div>
                        <strong className="text-gray-700">Requirements:</strong>
                        <p className="mt-1 text-gray-600">{event.pet_requirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Organizer Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Organizer Details</h2>
                  <div className="space-y-3">
                    <div className="text-gray-600">
                      <strong className="block">Organized by:</strong>
                      <span>{event.organizer_name}</span>
                    </div>
                    <a
                      href={`mailto:${event.organizer_email}`}
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      {event.organizer_email}
                    </a>
                    {event.organizer_phone && (
                      <a
                        href={`tel:${event.organizer_phone}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Phone className="w-5 h-5 mr-3" />
                        {event.organizer_phone}
                      </a>
                    )}
                    {event.organizer_website && (
                      <a
                        href={event.organizer_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Globe className="w-5 h-5 mr-3" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ticket Booking Animation */}
      {showTicketAnimation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl transform animate-[scale-in_0.5s_ease-out] flex flex-col items-center mx-4">
            <Ticket className="w-16 h-16 text-[#00D26A] animate-[bounce_1s_ease-in-out_infinite]" />
            <h2 className="text-2xl font-bold mt-4 animate-[fade-in_0.5s_ease-out]">
              Ticket Booked!
            </h2>
            <p className="text-gray-600 mt-2 text-center animate-[fade-in_0.5s_ease-out_0.2s]">
              {numberOfTickets} ticket{numberOfTickets > 1 ? 's' : ''} booked successfully
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 p-6 bg-gray-50 rounded-b-3xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <a 
              href="https://instagram.com/petsu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#00D26A] transition-colors flex items-center gap-2"
            >
              <Instagram size={20} />
              <span>Follow us</span>
            </a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Petsu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
