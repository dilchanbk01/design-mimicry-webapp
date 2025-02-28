
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { BookingDialog } from "./components/BookingDialog";
import { GroomerTitle } from "./components/GroomerTitle";
import { GroomerBio } from "./components/GroomerBio";
import { GroomerServices } from "./components/GroomerServices";
import { GroomerInfo } from "./components/GroomerInfo";
import { GroomerPackages } from "./components/GroomerPackages";
import { GroomerSpecializations } from "./components/GroomerSpecializations";
import { GroomerImageBanner } from "./components/GroomerImageBanner";
import { BookingSection } from "./components/BookingSection";
import { Footer } from "@/components/layout/Footer";
import { calculateTotalPrice } from "./utils/booking";
import { useGroomer } from "./hooks/useGroomer";
import { useBooking } from "./hooks/useBooking";
import { Instagram } from "lucide-react";
import type { GroomingPackage } from "./types/packages";

export default function GroomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { groomer, packages, isLoading } = useGroomer(id);
  const { handleBookingConfirm, isProcessing, isBookingConfirmed, setIsBookingConfirmed } = useBooking(groomer);
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<'salon' | 'home'>('salon');
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [petDetails, setPetDetails] = useState<string>("");
  const [homeAddress, setHomeAddress] = useState<string>("");
  
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

  const handleBookingDialogOpen = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default navigation
    
    // Set default package if none selected
    if (!selectedPackage && packages.length > 0) {
      setSelectedPackage(packages[0]);
    }
    setIsBookingOpen(true);
  };

  const onConfirmBooking = async () => {
    await handleBookingConfirm({
      selectedDate,
      selectedTime,
      selectedServiceType,
      selectedPackage,
      petDetails,
      homeAddress
    });
  };

  const resetBookingForm = () => {
    setSelectedDate(addDays(new Date(), 1));
    setSelectedTime("");
    setSelectedPackage(null);
    setPetDetails("");
    setHomeAddress("");
    setIsBookingConfirmed(false);
    setIsBookingOpen(false);
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
                onBookNowClick={handleBookingDialogOpen}
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
      
      <Footer />
      
      {/* Booking Dialog */}
      <BookingDialog 
        isOpen={isBookingOpen}
        onClose={resetBookingForm}
        groomer={{
          id: groomer.id,
          name: groomer.salon_name,
          address: groomer.address,
          experienceYears: groomer.experience_years,
          specializations: groomer.specializations,
          price: groomer.price,
          profileImageUrl: groomer.profile_image_url,
          providesHomeService: groomer.provides_home_service,
          providesSalonService: groomer.provides_salon_service,
          homeServiceCost: groomer.home_service_cost || 0
        }}
        packages={packages}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedPackage={selectedPackage}
        selectedServiceType={selectedServiceType}
        petDetails={petDetails}
        homeAddress={homeAddress}
        isBookingConfirmed={isBookingConfirmed}
        totalPrice={calculateTotalPrice(
          selectedPackage ? selectedPackage.price : groomer.price,
          selectedServiceType, 
          groomer.home_service_cost || 0
        )}
        isProcessing={isProcessing}
        
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        onPackageChange={setSelectedPackage}
        onServiceTypeChange={handleServiceTypeChange}
        onPetDetailsChange={setPetDetails}
        onHomeAddressChange={setHomeAddress}
        onConfirm={onConfirmBooking}
      />
    </div>
  );
}
