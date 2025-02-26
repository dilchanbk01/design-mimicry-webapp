
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { GroomingHeader } from "./components/GroomingHeader";
import { GroomerCard } from "./components/GroomerCard";
import { BookingDialog } from "./components/BookingDialog";
import { GroomingHeroBanner } from "./components/GroomingHeroBanner";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Home, Store } from "lucide-react";
import type { GroomingPartner, GroomerProfile } from "./types";

export default function PetGrooming() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<GroomingPartner | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [petDetails, setPetDetails] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [serviceType, setServiceType] = useState<'salon' | 'home'>('salon');
  const [showNearby, setShowNearby] = useState(false);

  const { data: groomers = [] } = useQuery<GroomerProfile[]>({
    queryKey: ['groomers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .eq('application_status', 'approved');

      if (error) throw error;
      return data;
    }
  });

  const filteredGroomers = groomers.filter(groomer => {
    let matches = true;
    
    // Filter by service type
    if (serviceType === 'salon') {
      matches = matches && groomer.provides_salon_service;
    } else if (serviceType === 'home') {
      matches = matches && groomer.provides_home_service;
    }

    // Filter by nearby (placeholder - would need actual geo implementation)
    if (showNearby) {
      // In a real implementation, this would filter based on user's location
      matches = matches && true;
    }

    return matches;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Booking Confirmed!",
      description: `Your grooming appointment has been booked with ${selectedPartner?.name}`,
    });
    setIsBookingOpen(false);
    setBookingDate("");
    setBookingTime("");
    setPetDetails("");
  };

  return (
    <div className="min-h-screen bg-[#00D26A]">
      <GroomingHeader />
      
      <GroomingHeroBanner 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4 items-center">
            <Button
              variant={serviceType === 'salon' ? "default" : "outline"}
              onClick={() => setServiceType('salon')}
              className="flex-1 bg-white text-primary hover:bg-white/90"
            >
              <Store className="h-4 w-4 mr-2" />
              At Salon
            </Button>
            <Button
              variant={serviceType === 'home' ? "default" : "outline"}
              onClick={() => setServiceType('home')}
              className="flex-1 bg-white text-primary hover:bg-white/90"
            >
              <Home className="h-4 w-4 mr-2" />
              On Demand
            </Button>
          </div>
          <Button
            variant={showNearby ? "default" : "outline"}
            onClick={() => setShowNearby(!showNearby)}
            className="bg-white text-primary hover:bg-white/90"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Near me
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroomers.map((groomer) => (
            <GroomerCard
              key={groomer.id}
              partner={{
                id: groomer.id,
                name: groomer.salon_name,
                rating: 4.5,
                location: groomer.address,
                experience: `${groomer.experience_years}+ years experience`,
                price: `Starting from ₹${groomer.price}`,
                image: groomer.profile_image_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60',
                providesHomeService: groomer.provides_home_service,
                providesSalonService: groomer.provides_salon_service
              }}
              onBooking={() => {
                setSelectedPartner({
                  id: groomer.id,
                  name: groomer.salon_name,
                  rating: 4.5,
                  location: groomer.address,
                  experience: `${groomer.experience_years}+ years experience`,
                  price: `Starting from ₹${groomer.price}`,
                  image: groomer.profile_image_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60',
                  providesHomeService: groomer.provides_home_service,
                  providesSalonService: groomer.provides_salon_service
                });
                setIsBookingOpen(true);
              }}
              onViewDetails={() => navigate(`/groomer/${groomer.id}`)}
            />
          ))}
        </div>
      </main>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        selectedPartner={selectedPartner}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        petDetails={petDetails}
        onDateChange={setBookingDate}
        onTimeChange={setBookingTime}
        onPetDetailsChange={setPetDetails}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}
