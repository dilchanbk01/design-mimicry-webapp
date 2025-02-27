
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "./PriceDisplay";
import { ServiceTypeSelection } from "./ServiceTypeSelection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateTotalPrice, createBooking, sendConfirmationEmail } from "../utils/booking";
import type { GroomingPackage } from "../types/packages";
import type { GroomerProfile } from "../types";

interface BookingSectionProps {
  groomer: GroomerProfile;
  selectedPackage: GroomingPackage | null;
  selectedServiceType: 'salon' | 'home';
  packages: GroomingPackage[];
  onBookNowClick: () => void;
  onServiceTypeChange: (type: 'salon' | 'home') => void;
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
  const basePrice = selectedPackage ? selectedPackage.price : groomer.price;
  const totalPrice = calculateTotalPrice(
    basePrice,
    selectedServiceType,
    groomer.home_service_cost
  );

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-green-800">Book an Appointment</h2>
      
      {/* Service Type Selection with reduced size */}
      {groomer.provides_salon_service && groomer.provides_home_service && (
        <div className="mb-4">
          <ServiceTypeSelection
            selectedType={selectedServiceType}
            onChange={onServiceTypeChange}
            isProcessing={isProcessing}
            groomerProvidesSalon={groomer.provides_salon_service}
            groomerProvidesHome={groomer.provides_home_service}
            serviceOptions={{
              salon: { type: 'salon', additionalCost: 0, selected: selectedServiceType === 'salon' },
              home: { type: 'home', additionalCost: groomer.home_service_cost, selected: selectedServiceType === 'home' }
            }}
          />
        </div>
      )}

      {/* Display base price + any additional cost for home service */}
      <div className="mb-6">
        <PriceDisplay 
          basePrice={basePrice}
          homeServiceCost={groomer.home_service_cost} 
          serviceType={selectedServiceType}
        />
      </div>

      <Button 
        size="lg" 
        className="w-full"
        onClick={onBookNowClick}
      >
        Book Now
      </Button>
    </div>
  );
}
