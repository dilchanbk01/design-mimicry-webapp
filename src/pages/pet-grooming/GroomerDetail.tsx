import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Home, Store, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "./components/BookingDialog";
import { useToast } from "@/components/ui/use-toast";
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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Booking Confirmed!",
      description: `Your grooming appointment has been booked with ${groomer?.salon_name}`,
    });
    setIsBookingOpen(false);
    setBookingDate("");
    setBookingTime("");
    setPetDetails("");
  };

  if (!groomer) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-64 relative">
            <img
              src={groomer.profile_image_url || defaultImage}
              alt={groomer.salon_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{groomer.salon_name}</h1>
                <Button onClick={() => setIsBookingOpen(true)}>
                  Book Appointment
                </Button>
              </div>

              <div className="grid gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{groomer.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Scissors className="h-5 w-5 mr-2" />
                    <span>{groomer.experience_years}+ years experience</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  {groomer.provides_salon_service && (
                    <div className="flex items-center text-green-600">
                      <Store className="h-5 w-5 mr-2" />
                      <span>Salon Service Available</span>
                    </div>
                  )}
                  {groomer.provides_home_service && (
                    <div className="flex items-center text-blue-600">
                      <Home className="h-5 w-5 mr-2" />
                      <span>Home Service Available</span>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Price</h2>
                  <p className="text-lg text-primary">Starting from ₹{groomer.price}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {groomer.specializations.map((specialization: string) => (
                      <span
                        key={specialization}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {specialization}
                      </span>
                    ))}
                  </div>
                </div>

                {groomer.bio && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">About</h2>
                    <p className="text-gray-600">{groomer.bio}</p>
                  </div>
                )}
              </div>
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
