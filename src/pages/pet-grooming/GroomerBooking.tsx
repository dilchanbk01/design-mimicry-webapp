
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { Button } from "@/components/ui/button";
import { useGroomer } from "./hooks/useGroomer";
import { useBooking } from "./hooks/useBooking";
import { generateTimeSlots } from "./utils/timeSlots";
import { DateSelection } from "./components/booking/DateSelection";
import { TimeSlotGrid } from "./components/booking/TimeSlotGrid";
import { ServiceTypeButtons } from "./components/booking/ServiceTypeButtons";
import { PetDetailsInput } from "./components/booking/PetDetailsInput";
import { HomeAddressInput } from "./components/booking/HomeAddressInput";
import { BookingActions } from "./components/booking/BookingActions";
import { BookingHeader } from "./components/booking/BookingHeader";
import { LoadingState } from "./components/booking/LoadingState";
import type { GroomingPackage } from "./types/packages";

export default function GroomerBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { groomer, packages, isLoading } = useGroomer(id);
  const { handleBookingConfirm, isProcessing } = useBooking(groomer);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<'salon' | 'home'>('salon');
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [petDetails, setPetDetails] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  // Handle loading state
  if (isLoading || !groomer) {
    return <LoadingState />;
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Required Fields",
        description: "Please select both date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (selectedServiceType === 'home' && !homeAddress) {
      toast({
        title: "Address Required",
        description: "Please provide your home address for home service.",
        variant: "destructive",
      });
      return;
    }

    await handleBookingConfirm({
      selectedDate,
      selectedTime,
      selectedServiceType,
      selectedPackage,
      petDetails,
      homeAddress,
    });
  };

  const handleCancel = () => {
    navigate(`/pet-grooming/groomer/${id}`);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50">
      <GroomingHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={handleCancel}
        >
          ← Back to Groomer
        </Button>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <BookingHeader groomerName={groomer.salon_name} />

          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <DateSelection 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Time Slots */}
            <TimeSlotGrid 
              timeSlots={timeSlots}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />

            {/* Service Type */}
            <ServiceTypeButtons 
              groomer={groomer}
              selectedServiceType={selectedServiceType}
              onServiceTypeChange={setSelectedServiceType}
            />

            {/* Pet Details */}
            <PetDetailsInput 
              petDetails={petDetails}
              onPetDetailsChange={setPetDetails}
            />

            {/* Home Address (for home service) */}
            {selectedServiceType === 'home' && (
              <HomeAddressInput 
                homeAddress={homeAddress}
                onHomeAddressChange={setHomeAddress}
              />
            )}

            {/* Booking Actions */}
            <BookingActions 
              onCancel={handleCancel}
              onConfirm={handleConfirmBooking}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
