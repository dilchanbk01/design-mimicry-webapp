
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { Button } from "@/components/ui/button";
import { useGroomer } from "./hooks/useGroomer";
import { useBooking } from "./hooks/useBooking";
import { generateTimeSlots } from "./utils/timeSlots";
import { DateSelection } from "./components/booking/DateSelection";
import { ServiceTypeButtons } from "./components/booking/ServiceTypeButtons";
import { PetDetailsInput } from "./components/booking/PetDetailsInput";
import { HomeAddressInput } from "./components/booking/HomeAddressInput";
import { BookingActions } from "./components/booking/BookingActions";
import { BookingHeader } from "./components/booking/BookingHeader";
import { LoadingState } from "./components/booking/LoadingState";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { GroomingPackage } from "./types/packages";

interface TimeSlot {
  date: string;
  times: string[];
}

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
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAvailableTimeSlots();
    }
  }, [id]);

  useEffect(() => {
    if (availableTimeSlots.length > 0) {
      updateAvailableTimes(selectedDate);
    }
  }, [selectedDate, availableTimeSlots]);

  const fetchAvailableTimeSlots = async () => {
    try {
      setIsLoadingTimeSlots(true);
      const { data, error } = await supabase
        .from('groomer_time_slots')
        .select('*')
        .eq('groomer_id', id);

      if (error) {
        console.error("Error fetching available time slots:", error);
        // If there's an error, fall back to default time slots
        setAvailableTimes(generateTimeSlots());
      } else if (data && data.length > 0) {
        setAvailableTimeSlots(data);
        // Initialize available times based on the selected date
        updateAvailableTimes(selectedDate);
      } else {
        // If no custom slots are defined, use default time slots
        setAvailableTimes(generateTimeSlots());
      }
    } catch (error) {
      console.error("Error in fetchAvailableTimeSlots:", error);
      setAvailableTimes(generateTimeSlots());
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const updateAvailableTimes = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const slotForDate = availableTimeSlots.find(slot => slot.date === dateString);
    
    if (slotForDate && slotForDate.times.length > 0) {
      setAvailableTimes(slotForDate.times);
    } else {
      // If no specific slots for this date, fall back to default
      setAvailableTimes(generateTimeSlots());
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset selected time when date changes
  };

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

  const displayTimeSlots = showAllTimeSlots ? availableTimes : availableTimes.slice(0, 8);

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
              onDateChange={handleDateChange}
            />

            {/* Time Slots with See More functionality */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
              {isLoadingTimeSlots ? (
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : availableTimes.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No available time slots for this date. Please select another date.</p>
                </div>
              ) : (
                <>
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
                  {!showAllTimeSlots && availableTimes.length > 8 && (
                    <button
                      onClick={() => setShowAllTimeSlots(true)}
                      className="w-full mt-3 text-center py-2 text-sm text-green-600 hover:text-green-800"
                    >
                      See More Time Slots ↓
                    </button>
                  )}
                </>
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
