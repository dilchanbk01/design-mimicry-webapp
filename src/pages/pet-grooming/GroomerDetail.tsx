
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { GroomerTitle } from "./components/GroomerTitle";
import { GroomerBio } from "./components/GroomerBio";
import { GroomerServices } from "./components/GroomerServices";
import { GroomerInfo } from "./components/GroomerInfo";
import { GroomerPackages } from "./components/GroomerPackages";
import { GroomerSpecializations } from "./components/GroomerSpecializations";
import { GroomerImageBanner } from "./components/GroomerImageBanner";
import { BookingSection } from "./components/BookingSection";
import { useGroomer } from "./hooks/useGroomer";
import { Instagram } from "lucide-react";
import type { GroomingPackage } from "./types/packages";

export default function GroomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { groomer, packages, isLoading } = useGroomer(id);
  
  const [selectedServiceType, setSelectedServiceType] = useState<'salon' | 'home'>('salon');
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <GroomingHeader />
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600">Loading groomer details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle case when groomer doesn't exist or is no longer available
  if (!groomer) {
    return (
      <div className="min-h-screen bg-white">
        <GroomingHeader />
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Groomer Not Found</h2>
            <p className="text-gray-600 mb-6">The groomer you're looking for doesn't exist or is no longer available.</p>
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              onClick={() => navigate("/pet-grooming")}
            >
              Back to Pet Grooming
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleServiceTypeChange = (type: 'salon' | 'home') => {
    setSelectedServiceType(type);
    // Reset the selected package when changing service type
    setSelectedPackage(null);
  };

  const handlePackageSelect = (pkg: GroomingPackage | null) => {
    setSelectedPackage(pkg);
  };

  // Now redirects to the booking page instead of opening a dialog
  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/pet-grooming/booking/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <GroomingHeader />
      
      <GroomerImageBanner 
        imageUrl={groomer.profile_image_url} 
        altText={groomer.salon_name} 
      />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GroomerTitle title={groomer.salon_name} />
            
            <div className="mt-4">
              <GroomerSpecializations specializations={groomer.specializations} />
            </div>
            
            <div className="mt-6">
              <GroomerServices 
                providesSalonService={groomer.provides_salon_service} 
                providesHomeService={groomer.provides_home_service} 
              />
            </div>

            {/* Packages moved above booking section */}
            <div className="mt-8">
              <GroomerPackages 
                packages={packages} 
                selectedPackage={selectedPackage}
                onSelectPackage={handlePackageSelect}
                groomerPrice={groomer.price}
                isProcessing={isProcessing}
              />
            </div>
            
            {(groomer.provides_salon_service || groomer.provides_home_service) && (
              <BookingSection
                groomer={groomer}
                selectedPackage={selectedPackage}
                selectedServiceType={selectedServiceType}
                packages={packages}
                onBookNowClick={handleBookNowClick}
                onServiceTypeChange={handleServiceTypeChange}
                isProcessing={isProcessing}
              />
            )}
            
            <div className="mt-8">
              <GroomerBio bio={groomer.bio} />
            </div>
            
            <div className="mt-8">
              <GroomerInfo 
                experienceYears={groomer.experience_years} 
                address={groomer.address} 
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Empty column for layout balance */}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#00D26A] py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-4 text-white">
              <a 
                href="https://instagram.com/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white/80 transition-colors"
              >
                <Instagram size={14} />
                <span className="text-xs">Follow us</span>
              </a>
            </div>

            <p className="text-[10px] text-white/90 text-center">
              © 2025 Petsu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
