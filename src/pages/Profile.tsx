
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface UserEvent {
  id: string;
  title: string;
  date: string;
  image_url: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Booking {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    image_url: string;
    location: string;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch events created by user
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", user.id)
          .order('date', { ascending: false });

        if (eventsError) throw eventsError;
        // Add type assertion to ensure events conform to UserEvent interface
        setUserEvents((events || []).map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        })));

        // Fetch user's bookings with event details
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            event:events (
              id,
              title,
              date,
              image_url,
              location
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "confirmed");

        if (bookingsError) throw bookingsError;
        setUserBookings(bookings || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-primary py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>

          <div className="space-y-8">
            {/* Your Events Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Events You're Hosting</h2>
              {userEvents.length === 0 ? (
                <p className="text-gray-600">
                  You haven't created any events yet.{" "}
                  <Button
                    variant="link"
                    onClick={() => navigate("/events/create")}
                    className="p-0"
                  >
                    Create your first event
                  </Button>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.date), "PPP")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Your Bookings Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
              {userBookings.length === 0 ? (
                <p className="text-gray-600">
                  You haven't booked any events yet.{" "}
                  <Button
                    variant="link"
                    onClick={() => navigate("/events")}
                    className="p-0"
                  >
                    Browse events
                  </Button>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/events/${booking.event.id}`)}
                    >
                      <img
                        src={booking.event.image_url}
                        alt={booking.event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{booking.event.title}</h3>
                        <p className="text-sm text-gray-600">{booking.event.location}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(booking.event.date), "PPP")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
