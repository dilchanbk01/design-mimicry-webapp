
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Plus, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

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

interface HeroBanner {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch hero banner
  const { data: heroBanner } = useQuery({
    queryKey: ['heroBanner', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('active', true)
        .eq('page', 'events')
        .single();

      if (error) {
        console.error('Error fetching hero banner:', error);
        return null;
      }

      return data as HeroBanner;
    }
  });

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq('status', 'approved')
          .order("date", { ascending: true });

        if (error) throw error;

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
          <div className="flex items-center justify-between">
            <Button
              onClick={handleCreateEventClick}
              className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-blue-900 gap-2 rounded-full shadow-lg"
              size="sm"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Button>

            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />

            <div className="flex items-center gap-4">
              {isSearchOpen ? (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 rounded-full bg-white shadow-lg w-64"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <Search 
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {heroBanner && (
        <div className="relative pt-16">
          <div className="w-full h-[300px] relative">
            <img
              src={heroBanner.image_url}
              alt="Hero Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {heroBanner.title}
                </h1>
                <p className="text-white/90 text-lg">
                  {heroBanner.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 col-span-full">
              <p className="text-white text-lg">No events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 line-clamp-1">
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
                    className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white"
                  >
                    Register Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
