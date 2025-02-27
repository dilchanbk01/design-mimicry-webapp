
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
import { MapPin } from "lucide-react";
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
    
    if (serviceType === 'salon') {
      matches = matches && groomer.provides_salon_service;
    } else if (serviceType === 'home') {
      matches = matches && groomer.provides_home_service;
    }

    if (showNearby) {
      matches = matches && true;
    }

    return matches;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      localStorage.setItem('redirectAfterAuth', location.pathname);
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this appointment.",
      });
      navigate("/auth");
      return;
    }

    if (!selectedPartner) return;

    // Extract numeric price value and convert to paise
    const priceMatch = selectedPartner.price.match(/\d+/);
    const priceInPaise = priceMatch ? parseInt(priceMatch[0]) * 100 : 0;

    const options = {
      key: "rzp_test_5wYJG4Y7jeVhsz",
      amount: priceInPaise,
      currency: "INR",
      name: "Petsu",
      description: `Grooming appointment with ${selectedPartner.name}`,
      image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
      handler: async function (response: any) {
        const booking = {
          groomer_id: selectedPartner.id,
          user_id: user.id,
          date: bookingDate,
          time: bookingTime,
          pet_details: petDetails,
          payment_id: response.razorpay_payment_id,
          status: 'confirmed',
          service_type: serviceType
        };

        const { error } = await supabase
          .from("grooming_bookings")
          .insert(booking);

        if (error) {
          toast({
            title: "Booking Failed",
            description: "Unable to complete your booking. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Booking Confirmed!",
          description: `Your grooming appointment has been booked with ${selectedPartner.name}`,
        });
        
        setIsBookingOpen(false);
        setBookingDate("");
        setBookingTime("");
        setPetDetails("");
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: "#00D26A",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
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
          <div className="grid grid-cols-2 gap-4 items-center">
            <Button
              variant={serviceType === 'salon' ? "default" : "outline"}
              onClick={() => setServiceType('salon')}
              className="bg-white text-primary hover:bg-white/90 w-full"
            >
              At Salon
            </Button>
            <Button
              variant={serviceType === 'home' ? "default" : "outline"}
              onClick={() => setServiceType('home')}
              className="bg-white text-primary hover:bg-white/90 w-full"
            >
              On Demand
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant={showNearby ? "default" : "outline"}
              onClick={() => setShowNearby(!showNearby)}
              className="bg-white text-primary hover:bg-white/90 px-3 py-1 h-8 text-sm"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Near me
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
