import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Plus, Search, User, ArrowLeft, Instagram, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useInterval } from "@/hooks/use-interval";
import type { Event } from "@/types/events";
import { getOptimizedImageUrl } from "@/utils/imageCompression";

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

interface Booking {
  event_id: string;
  user_id: string;
}

export default function Events() {
  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleCreateEventClick = () => {
    navigate('/events/create');
  };

  const isEventBooked = (eventId: string): boolean => {
    return userBookings.some(booking => booking.event_id === eventId);
  };

  const { data: queryEvents = [] } = useQuery({
    queryKey: ['events', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          image_url,
          date,
          location,
          price,
          capacity
        `)
        .eq('status', 'approved')
        .order("date", { ascending: true });

      if (error) throw error;
      
      return data.map(event => ({
        ...event,
        image_url: getOptimizedImageUrl(event.image_url)
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  const filteredEvents = queryEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: heroBanners = [] } = useQuery({
    queryKey: ['heroBanners'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('id, image_url, title, description')
          .eq('active', true)
          .eq('page', 'events');

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching hero banners:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  useInterval(() => {
    if (heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
  }, 4000);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventsSubscription = supabase
          .channel('events_channel')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'events',
          }, async () => {
            const { data: updatedEvents, error } = await supabase
              .from("events")
              .select("*")
              .eq('status', 'approved')
              .order("date", { ascending: true });

            if (!error && updatedEvents) {
              const currentEvents = updatedEvents.map(event => ({
                ...event,
                status: event.status as 'pending' | 'approved' | 'rejected'
              }));
              setLocalEvents(currentEvents);
            }
          })
          .subscribe();

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq('status', 'approved')
          .order("date", { ascending: true });

        if (error) throw error;

        const currentEvents = (data || []).map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        }));

        setLocalEvents(currentEvents);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('event_id, user_id')
            .eq('user_id', user.id)
            .eq('status', 'confirmed');

          if (!bookingsError && bookings) {
            setUserBookings(bookings);
          }
        }

        return () => {
          eventsSubscription.unsubscribe();
        };
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

  return (
    <div className="min-h-screen bg-[#00D26A]">
      {heroBanners.length > 0 && (
        <div className="relative h-[300px]">
          <div className="absolute inset-0 overflow-hidden">
            {heroBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Event banner'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  {(banner.title || banner.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      {banner.title && (
                        <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                      )}
                      {banner.description && (
                        <p className="text-lg">{banner.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-4'
                    : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <header className="absolute top-0 left-0 right-0 bg-transparent z-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-6 w-6" />
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
                    <User className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant={showNearbyOnly ? "outline" : "default"}
            onClick={() => setShowNearbyOnly(!showNearbyOnly)}
            className="bg-white text-primary hover:bg-white/90"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {showNearbyOnly ? 'Show All Events' : 'Show Nearby'}
          </Button>
          <Button
            onClick={handleCreateEventClick}
            className="bg-white text-primary hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

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
                    <div className="flex items-center text-gray-600">
                      <span className="font-semibold">₹{event.price}</span>
                    </div>
                  </div>
                  <Button
                    className={`w-full mt-6 ${
                      isEventBooked(event.id)
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-900 hover:bg-blue-800"
                    } text-white`}
                    disabled={isEventBooked(event.id)}
                  >
                    {isEventBooked(event.id) ? "Booked" : "Book Now"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="bg-[#00D26A] py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors flex items-center gap-2"
              >
                <Instagram size={16} />
                <span className="text-sm">Follow us</span>
              </a>
              <a 
                href="https://linkedin.com/company/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Linkedin size={16} />
              </a>
            </div>

            <div className="flex space-x-4 text-xs text-white/90">
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-white/50">•</span>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-white transition-colors"
              >
                Terms & Conditions
              </button>
            </div>

            <p className="text-[10px] text-white/70">
              © {new Date().getFullYear()} Petsu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
