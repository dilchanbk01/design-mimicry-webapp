
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
import { Home, Store, Info } from "lucide-react";
import type { GroomingPartner, GroomerProfile } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PetGrooming() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [serviceType, setServiceType] = useState<'salon' | 'home'>('salon');

  const { data, isLoading } = useQuery({
    queryKey: ['groomers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .eq('application_status', 'approved')
        .eq('is_available', true); // Only show available groomers

      if (error) {
        console.error("Error fetching groomers:", error);
        throw error;
      }
      return data || [];
    }
  });

  // Ensure data is treated as an array
  const groomers = Array.isArray(data) ? data : [];

  const filteredGroomers = groomers.filter(groomer => {
    let matches = true;
    
    if (serviceType === 'salon') {
      matches = matches && groomer.provides_salon_service;
    } else if (serviceType === 'home') {
      matches = matches && groomer.provides_home_service;
    }

    return matches;
  });

  return (
    <div className="min-h-screen bg-[#00D26A]">
      <GroomingHeader />
      
      <GroomingHeroBanner 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={serviceType === 'salon' ? "default" : "outline"}
                    onClick={() => setServiceType('salon')}
                    className={`bg-white text-primary hover:bg-white/90 w-full ${
                      serviceType === 'salon' ? 'border-4 border-[#00D26A] text-[#00D26A] font-bold' : ''
                    }`}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    At Salon
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visit the groomer's salon for service</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={serviceType === 'home' ? "default" : "outline"}
                    onClick={() => setServiceType('home')}
                    className={`bg-white text-primary hover:bg-white/90 w-full ${
                      serviceType === 'home' ? 'border-4 border-[#00D26A] text-[#00D26A] font-bold' : ''
                    }`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home Visit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Groomer will come to your home</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="mt-2 bg-white/10 rounded-lg p-3 text-white text-sm">
            {serviceType === 'salon' ? (
              <div className="flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p>Visit the groomer's salon for professional grooming services</p>
              </div>
            ) : (
              <div className="flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p></p>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white/20 animate-pulse h-64 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroomers.length > 0 ? (
              filteredGroomers.map((groomer) => (
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
                  onViewDetails={() => navigate(`/groomer/${groomer.id}`)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-10 bg-white/10 rounded-lg">
                <h3 className="text-white text-lg font-medium mb-2">No groomers available</h3>
                <p className="text-white/80">
                  {serviceType === 'home' 
                    ? "No groomers currently offer home visits in your area. Try the salon option instead." 
                    : "No salon services available right now. Try the home visit option."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
