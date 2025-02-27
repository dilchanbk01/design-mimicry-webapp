
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
  const [showAllTimeSlots, setShowAllTimeSlots] = useState(false);

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
  const displayTimeSlots = showAllTimeSlots ? timeSlots : timeSlots.slice(0, 8);

  return (
    <div className="min-h-screen bg-green-500" style={{ backgroundColor: "#0dcf6a" }}>
      <GroomingHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/20"
          onClick={handleCancel}
        >
          ← 
        </Button>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <BookingHeader groomerName={groomer.salon_name} />

          <div className="p-6 space-y-6">
            {/* Service Type - Moved to the top */}
            <ServiceTypeButtons 
              groomer={groomer}
              selectedServiceType={selectedServiceType}
              onServiceTypeChange={setSelectedServiceType}
            />

            {/* Date Selection */}
            <DateSelection 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Time Slots with See More functionality */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
              <div className="grid grid-cols-4 gap-3">
                {displayTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 text-center rounded-md transition-colors ${
                      selectedTime === time
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {!showAllTimeSlots && timeSlots.length > 8 && (
                <button
                  onClick={() => setShowAllTimeSlots(true)}
                  className="w-full mt-3 text-center py-2 text-sm text-green-600 hover:text-green-800"
                >
                  See More Time Slots ↓
                </button>
              )}
            </div>

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
