
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/layout/Footer";
import { GroomerCard } from "./components/GroomerCard";
import { GroomingHeader } from "./components/GroomingHeader";
import { GroomingHeroBanner } from "./components/GroomingHeroBanner";
import { useInterval } from "@/hooks/use-interval";
import { partners } from "./data/partners";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";

export default function PetGrooming() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [serviceFilters, setServiceFilters] = useState({
    inSalon: false,
    atHome: false,
  });
  
  const { data: groomers = [], isLoading } = useQuery({
    queryKey: ['approvedGroomers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .eq('application_status', 'approved');
        
      if (error) {
        console.error('Error fetching groomers:', error);
        return [];
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Automatic slideshow for hero banner
  useInterval(() => {
    const heroBanners = document.querySelectorAll('[data-hero-banner]');
    if (heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
  }, 5000);
  
  const toggleServiceFilter = (filter: 'inSalon' | 'atHome') => {
    setServiceFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const filteredGroomers = groomers.filter(groomer => {
    // Apply text search filter
    const matchesSearch = 
      !searchQuery || 
      groomer.salon_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      groomer.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply service type filters
    const matchesServiceType = 
      // If no service filters are active, show all groomers
      (!serviceFilters.inSalon && !serviceFilters.atHome) ||
      // Otherwise, check if the groomer matches the active filters
      (serviceFilters.inSalon && groomer.provides_salon_service) ||
      (serviceFilters.atHome && groomer.provides_home_service);
    
    return matchesSearch && matchesServiceType;
  });
  
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0dcf6a" }}>
      <GroomingHeader />
      
      <GroomingHeroBanner 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            {/* Title only visible on tablet/desktop */}
            <h2 className="text-2xl font-bold text-white hidden md:block">Available Pet Groomers</h2>
            
            {/* Filter buttons - centered on mobile, aligned right on desktop */}
            <div className="flex space-x-3 justify-center md:justify-end w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className={`flex items-center gap-2 ${serviceFilters.inSalon ? 'bg-white text-green-600' : 'bg-white/20 text-white'}`}
                onClick={() => toggleServiceFilter('inSalon')}
              >
                {serviceFilters.inSalon ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                In Salon
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className={`flex items-center gap-2 ${serviceFilters.atHome ? 'bg-white text-green-600' : 'bg-white/20 text-white'}`}
                onClick={() => toggleServiceFilter('atHome')}
              >
                {serviceFilters.atHome ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                At Home
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 h-64 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredGroomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroomers.map(groomer => (
                <GroomerCard 
                  key={groomer.id} 
                  partner={{
                    id: groomer.id,
                    name: groomer.salon_name,
                    location: groomer.address,
                    experience: `${groomer.experience_years} years of experience`,
                    price: `Starting from ₹${groomer.price}`,
                    image: groomer.profile_image_url || '/placeholder.svg',
                    providesHomeService: groomer.provides_home_service || false,
                    providesSalonService: groomer.provides_salon_service || false,
                    rating: 4.5 // Default rating or we could calculate this from reviews
                  }}
                  onViewDetails={() => {
                    // Navigate to the groomer details page - using correct URL format
                    window.location.href = `/pet-grooming/${groomer.id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white">
              <p className="mb-4">No pet groomers available matching your filters.</p>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
