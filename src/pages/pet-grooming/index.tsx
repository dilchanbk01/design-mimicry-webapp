
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GroomerCard } from "./components/GroomerCard";
import { GroomingHeader } from "./components/GroomingHeader";
import { GroomingHeroBanner } from "./components/GroomingHeroBanner";
import { useInterval } from "@/hooks/use-interval";
import { partners } from "./data/partners";

export default function PetGrooming() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
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
  
  const filteredGroomers = groomers.filter(groomer => 
    groomer.salon_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    groomer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header transparent={false} />
      
      <GroomingHeroBanner 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />
      
      <GroomingHeader 
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsSearchOpen={setIsSearchOpen}
      />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Available Pet Groomers</h2>
          
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
                <GroomerCard key={groomer.id} groomer={groomer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No pet groomers available in your area yet.</p>
              <p className="text-gray-500">We're expanding our network! Check back soon.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
