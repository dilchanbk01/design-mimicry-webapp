
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Home, Store, ArrowLeft, Calendar, User } from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "./components/BookingDialog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import type { GroomerProfile } from "./types";

export default function GroomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [petDetails, setPetDetails] = useState("");

  const { data: groomer } = useQuery<GroomerProfile>({
    queryKey: ['groomer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
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

    if (!groomer) return;

    // Extract numeric price value and convert to paise
    const priceInPaise = groomer.price * 100;

    const options = {
      key: "rzp_test_5wYJG4Y7jeVhsz",
      amount: priceInPaise,
      currency: "INR",
      name: "Petsu",
      description: `Grooming appointment with ${groomer.salon_name}`,
      image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
      handler: async function (response: any) {
        const booking = {
          groomer_id: groomer.id,
          user_id: user.id,
          date: bookingDate,
          time: bookingTime,
          pet_details: petDetails,
          payment_id: response.razorpay_payment_id,
          status: 'confirmed',
          service_type: groomer.provides_home_service ? 'home' : 'salon'
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
          description: `Your grooming appointment has been booked with ${groomer.salon_name}`,
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

    // @ts-ignore - Razorpay is loaded from CDN
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (!groomer) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-60 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const defaultImage = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button, logo and profile */}
      <div className="bg-white shadow-sm py-3 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu" 
              className="h-8"
            />
          </div>
          
          <button 
            onClick={() => navigate('/profile')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 md:py-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-48 sm:h-64 relative">
            <img
              src={groomer.profile_image_url || defaultImage}
              alt={groomer.salon_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent"></div>
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium">4.5</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">{groomer.salon_name}</h1>
              <Button 
                onClick={() => setIsBookingOpen(true)}
                className="md:w-auto w-full bg-[#00D26A] hover:bg-[#00b05a]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{groomer.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Scissors className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{groomer.experience_years}+ years experience</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {groomer.provides_salon_service && (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <Store className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Salon Service Available</span>
                  </div>
                )}
                {groomer.provides_home_service && (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Home Service Available</span>
                  </div>
                )}
              </div>

              <Card className="border-[#00D26A]/20">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-2">Price</h2>
                  <p className="text-xl text-[#00D26A] font-medium">Starting from ₹{groomer.price}</p>
                </CardContent>
              </Card>

              <div>
                <h2 className="text-lg font-semibold mb-3">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {groomer.specializations.map((specialization: string) => (
                    <span
                      key={specialization}
                      className="px-3 py-1 bg-[#00D26A]/10 text-[#00D26A] rounded-full text-sm"
                    >
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>

              {groomer.bio && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{groomer.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <BookingDialog
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          selectedPartner={{
            id: groomer.id,
            name: groomer.salon_name,
            rating: 4.5,
            location: groomer.address,
            experience: `${groomer.experience_years}+ years experience`,
            price: `Starting from ₹${groomer.price}`,
            image: groomer.profile_image_url || defaultImage,
            providesHomeService: groomer.provides_home_service,
            providesSalonService: groomer.provides_salon_service
          }}
          bookingDate={bookingDate}
          bookingTime={bookingTime}
          petDetails={petDetails}
          onDateChange={setBookingDate}
          onTimeChange={setBookingTime}
          onPetDetailsChange={setPetDetails}
          onSubmit={handleBookingSubmit}
        />
      </div>
    </div>
  );
}
