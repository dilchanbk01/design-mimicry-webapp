
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useGroomer } from "./hooks/useGroomer";
import { useBooking } from "./hooks/useBooking";
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

  if (isLoading || !groomer) {
    return (
      <div className="min-h-screen bg-white">
        <GroomingHeader />
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
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

    await handleBookingConfirm({
      selectedDate,
      selectedTime,
      selectedServiceType,
      selectedPackage,
      petDetails,
      homeAddress,
    });
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GroomingHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/pet-grooming/groomer/${id}`)}
        >
          ← Back to Groomer
        </Button>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-600 mt-1">with {groomer.salon_name}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((time) => (
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
            </div>

            {/* Service Type */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Type</h3>
              <div className="flex gap-4">
                {groomer.provides_salon_service && (
                  <button
                    onClick={() => setSelectedServiceType('salon')}
                    className={`flex-1 p-4 rounded-lg border ${
                      selectedServiceType === 'salon'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <h4 className="font-medium">Salon Visit</h4>
                    <p className="text-sm text-gray-500">Visit the groomer's location</p>
                  </button>
                )}
                {groomer.provides_home_service && (
                  <button
                    onClick={() => setSelectedServiceType('home')}
                    className={`flex-1 p-4 rounded-lg border ${
                      selectedServiceType === 'home'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <h4 className="font-medium">Home Visit</h4>
                    <p className="text-sm text-gray-500">Groomer visits your location</p>
                    <p className="text-sm text-green-600 mt-1">+₹{groomer.home_service_cost}</p>
                  </button>
                )}
              </div>
            </div>

            {/* Pet Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pet Details</h3>
              <textarea
                value={petDetails}
                onChange={(e) => setPetDetails(e.target.value)}
                placeholder="Tell us about your pet (type, breed, age, etc.)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
              />
            </div>

            {/* Home Address (for home service) */}
            {selectedServiceType === 'home' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Home Address</h3>
                <textarea
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
            )}

            {/* Booking Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                variant="outline"
                onClick={() => navigate(`/pet-grooming/groomer/${id}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
