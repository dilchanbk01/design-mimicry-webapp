
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

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
  status: 'pending' | 'approved' | 'rejected';
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq('status', 'approved')
          .order("date", { ascending: true });

        if (error) throw error;

        // Filter out past events
        const currentEvents = (data || [])
          .filter(event => !isPast(new Date(event.date)))
          .map(event => ({
            ...event,
            status: event.status as 'pending' | 'approved' | 'rejected'
          }));

        setEvents(currentEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [toast]);

  const handleCreateEventClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event.",
      });
      navigate("/auth");
      return;
    }
    
    navigate("/events/create");
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00D26A]">
      {/* Transparent Header */}
      <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-12 mb-2"
            />
            <Button
              onClick={handleCreateEventClick}
              className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-blue-900 gap-2 rounded-full shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-36 px-4 pb-20">
        <div className="container mx-auto max-w-lg">
          {/* Search Bar */}
          <div className="sticky top-32 bg-[#00D26A] pt-4 pb-2 z-40">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 rounded-full bg-white text-base shadow-lg"
              />
            </div>
          </div>

          {/* Events List */}
          <div className="mt-6 space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white text-lg">No events found</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>{format(new Date(event.date), "PPP")}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>{format(new Date(event.date), "p")}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-3 bg-blue-900 hover:bg-blue-800 text-white text-sm py-1 h-8"
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
