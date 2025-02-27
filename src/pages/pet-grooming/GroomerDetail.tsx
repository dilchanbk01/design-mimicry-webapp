
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGroomer } from "./hooks/useGroomer";
import { GroomerImageBanner } from "./components/GroomerImageBanner";
import { GroomerTitle } from "./components/GroomerTitle";
import { GroomerInfo } from "./components/GroomerInfo";
import { GroomerSpecializations } from "./components/GroomerSpecializations";
import { GroomerBio } from "./components/GroomerBio";
import { GroomerServices } from "./components/GroomerServices";
import { GroomerPackages } from "./components/GroomerPackages";
import { GroomerBookingSection } from "./components/GroomerBookingSection";
import { useToast } from "@/hooks/use-toast";

export default function GroomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { groomer, packages, isLoading } = useGroomer(id);
  const [selectedServiceType, setSelectedServiceType] = useState<'salon' | 'home'>('salon');
  const { toast } = useToast();
  const [bookingCompleted, setBookingCompleted] = useState(false);

  const handleBookingComplete = () => {
    setBookingCompleted(true);
    toast({
      title: "Booking Successful!",
      description: `Your appointment with ${groomer?.salon_name} has been confirmed.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!groomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Groomer not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GroomerImageBanner 
        profileImageUrl={groomer.profile_image_url} 
        altText={`${groomer.salon_name} profile`}
      />
      
      <div className="container mx-auto px-4 py-6 -mt-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <GroomerTitle 
                name={groomer.salon_name} 
                years={groomer.experience_years}
                isAvailable={groomer.is_available}
              />
              
              <GroomerInfo 
                address={groomer.address}
                contactNumber={groomer.contact_number}
                experienceYears={groomer.experience_years}
              />
              
              <GroomerSpecializations 
                specializations={groomer.specializations} 
              />
              
              {groomer.bio && (
                <GroomerBio bio={groomer.bio} />
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <GroomerServices 
                providesSalonService={groomer.provides_salon_service}
                providesHomeService={groomer.provides_home_service}
                homeServiceCost={groomer.home_service_cost}
              />
            </div>
            
            {packages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <GroomerPackages packages={packages} />
              </div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <GroomerBookingSection
                groomer={groomer}
                packages={packages}
                selectedServiceType={selectedServiceType}
                onServiceTypeChange={setSelectedServiceType}
                onBookingComplete={handleBookingComplete}
              />
              
              {bookingCompleted && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Booking Confirmed!</h3>
                      <p className="text-sm text-green-600">Thank you for booking with us.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
