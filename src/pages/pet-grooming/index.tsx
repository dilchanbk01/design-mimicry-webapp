
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
  const [serviceType, setServiceType] = useState<'all' | 'salon' | 'home'>('all');

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
    if (serviceType === 'all') return true;
    if (serviceType === 'salon') return groomer.provides_salon_service;
    if (serviceType === 'home') return groomer.provides_home_service;
    return true;
  });

  const handleBooking = (partner: GroomingPartner) => {
    setSelectedPartner(partner);
    setIsBookingOpen(true);
  };

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
    <div className="min-h-screen bg-gray-50">
      <GroomingHeader />
      
      <GroomingHeroBanner 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <div className="flex gap-4">
            <Button
              variant={serviceType === 'all' ? 'default' : 'outline'}
              onClick={() => setServiceType('all')}
            >
              All Services
            </Button>
            <Button
              variant={serviceType === 'salon' ? 'default' : 'outline'}
              onClick={() => setServiceType('salon')}
            >
              Salon Service
            </Button>
            <Button
              variant={serviceType === 'home' ? 'default' : 'outline'}
              onClick={() => setServiceType('home')}
            >
              Home Service
            </Button>
          </div>
        </nav>

        <main className="grid gap-6">
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
              onBooking={handleBooking}
              onViewDetails={() => navigate(`/groomer/${groomer.id}`)}
            />
          ))}
        </main>
      </div>

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
