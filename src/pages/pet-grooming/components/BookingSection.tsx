
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "./PriceDisplay";
import { ServiceTypeSelection } from "./ServiceTypeSelection";
import { BookAppointmentButton } from "./BookAppointmentButton";
import { useNavigate } from "react-router-dom";
import type { GroomerProfile } from "../types";
import type { GroomingPackage } from "../types/packages";

interface BookingSectionProps {
  groomer: GroomerProfile;
  selectedPackage: GroomingPackage | null;
  selectedServiceType: 'salon' | 'home';
  packages: GroomingPackage[];
  onBookNowClick?: (e: React.MouseEvent) => void;
  onServiceTypeChange: (serviceType: 'salon' | 'home') => void;
  isProcessing: boolean;
}

export function BookingSection({ 
  groomer, 
  selectedPackage, 
  selectedServiceType, 
  packages,
  onBookNowClick,
  onServiceTypeChange,
  isProcessing
}: BookingSectionProps) {
  const navigate = useNavigate();
  const basePrice = selectedPackage ? selectedPackage.price : groomer.price;
  const homeServiceCost = selectedServiceType === 'home' ? groomer.home_service_cost : 0;

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/pet-grooming/booking/${groomer.id}`);
  };

  return (
    <div className="mt-8 border border-green-200 rounded-xl p-5 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-green-800 mb-4">Book an Appointment</h2>
      
      <ServiceTypeSelection 
        selectedType={selectedServiceType}
        onChange={onServiceTypeChange}
        groomerProvidesSalon={groomer.provides_salon_service}
        groomerProvidesHome={groomer.provides_home_service}
        isProcessing={isProcessing}
        homeServiceCost={groomer.home_service_cost}
      />
      
      <div className="mt-6 border-t border-gray-100 pt-5">
        <PriceDisplay 
          basePrice={basePrice}
          homeServiceCost={homeServiceCost}
          serviceType={selectedServiceType}
        />
        
        <div className="mt-4">
          <BookAppointmentButton 
            onClick={handleBookNowClick}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
