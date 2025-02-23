
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Plus, Search, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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
        setEvents((data || []).map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        })));
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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8"
            />
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 px-4 pb-20">
        <div className="container mx-auto max-w-lg">
          {/* Search Bar */}
          <div className="sticky top-16 bg-[#00D26A] pt-4 pb-2 z-40">
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
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{format(new Date(event.date), "PPP")}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{format(new Date(event.date), "p")}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-blue-900 hover:bg-blue-800 text-white"
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

      {/* Fixed Create Event Button */}
      <Button
        onClick={handleCreateEventClick}
        className="fixed bottom-6 right-6 bg-[#FFD700] hover:bg-[#FFD700]/90 text-blue-900 gap-2 rounded-full shadow-lg"
        size="lg"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Create Event</span>
      </Button>
    </div>
  );
}
