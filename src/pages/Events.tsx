import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useInterval } from "@/hooks/use-interval";
import type { Event } from "@/types/events";
import { getOptimizedImageUrl } from "@/utils/imageCompression";
import { EventsHeader } from "@/components/events/EventsHeader";
import { EventCard } from "@/components/events/EventCard";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/events/HeroBanner";

interface Booking {
  event_id: string;
  user_id: string;
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
          duration,
          location,
          price,
          capacity,
          event_type,
          organizer_name,
          organizer_email,
          organizer_phone,
          organizer_website,
          pet_types,
          pet_requirements
        `)
        .eq('status', 'approved')
        .order("date", { ascending: true });

      if (error) throw error;
      
      const now = new Date();
      const futureEvents = data.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now;
      });
      
      return futureEvents.map(event => ({
        ...event,
        image_url: getOptimizedImageUrl(event.image_url)
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const getDistance = (eventLocation: string) => {
    if (!userLocation) return Infinity;
    
    const pincodeMatch = eventLocation.match(/\b\d{6}\b/);
    if (!pincodeMatch) return Infinity;
    
    const pincode = pincodeMatch[0];
    return Math.abs(parseInt(pincode) - parseInt(localStorage.getItem('userPincode') || '0'));
  };

  const filteredEvents = queryEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (showNearbyOnly) {
      return getDistance(a.location) - getDistance(b.location);
    }
    return 0;
  });

  useInterval(() => {
    const heroBanners = document.querySelectorAll('[data-hero-banner]');
    if (heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
  }, 4000);

  useEffect(() => {
    async function fetchUserBookings() {
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
    }

    fetchUserBookings();
  }, []);

  const isEventBooked = (eventId: string): boolean => {
    return userBookings.some(booking => booking.event_id === eventId);
  };

  const handleCreateEventClick = () => {
    navigate('/create-event');
  };

  return (
    <div className="min-h-screen bg-[#00D26A] flex flex-col">
      <HeroBanner currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />
      
      <EventsHeader
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsSearchOpen={setIsSearchOpen}
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant={showNearbyOnly ? "outline" : "default"}
            onClick={() => setShowNearbyOnly(!showNearbyOnly)}
            className="bg-white text-primary hover:bg-white/90"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {showNearbyOnly ? 'All Events' : 'Near me'}
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
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 col-span-full">
              <p className="text-white text-lg">No events found</p>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isBooked={isEventBooked(event.id)}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
