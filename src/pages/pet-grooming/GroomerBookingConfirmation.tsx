
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, parse, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { TimeSlotSelector } from "./components/TimeSlotSelector";
import { ServiceTypeSelection } from "./components/ServiceTypeSelection";
import { useGroomer } from "./hooks/useGroomer";
import { useBooking } from "./hooks/useBooking";
import { calculateTotalPrice } from "./utils/booking";
import type { GroomingPackage } from "./types/packages";

export default function GroomerBookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { groomer, packages, isLoading } = useGroomer(id);
  const { handleBookingConfirm, isProcessing, isBookingConfirmed } = useBooking(groomer);
  
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<'salon' | 'home'>('salon');
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [petDetails, setPetDetails] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [petType, setPetType] = useState<string>("");
  const [homeAddress, setHomeAddress] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  
  // Set default package on initial load
  useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      setSelectedPackage(null); // Default to standard grooming
    }
  }, [packages]);
  
  // Update home address when individual fields change
  useEffect(() => {
    if (selectedServiceType === 'home') {
      const fullAddress = [
        streetAddress,
        city,
        pincode ? pincode : ""
      ].filter(Boolean).join(", ");
      
      setHomeAddress(fullAddress);
    }
  }, [streetAddress, city, pincode, selectedServiceType]);
  
  // Handle loading state
  if (isLoading || !groomer) {
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

  // Calculate the total price
  const totalPrice = calculateTotalPrice(
    selectedPackage ? selectedPackage.price : groomer.price,
    selectedServiceType, 
    groomer.home_service_cost
  );

  const handleConfirm = async () => {
    // Validate required fields
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a date for your appointment",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedTime) {
      toast({
        title: "Time required",
        description: "Please select a time slot for your appointment",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedServiceType === 'home' && !homeAddress) {
      toast({
        title: "Address required",
        description: "Please provide your home address for the service",
        variant: "destructive"
      });
      return;
    }
    
    if (!petName || !petType) {
      toast({
        title: "Pet details required",
        description: "Please provide information about your pet",
        variant: "destructive"
      });
      return;
    }
    
    // Format pet details
    const formattedPetDetails = `Pet Name: ${petName}\nPet Type: ${petType}\nAdditional Information: ${petDetails}`;
    
    // Call booking function
    await handleBookingConfirm({
      selectedDate,
      selectedTime,
      selectedServiceType,
      selectedPackage,
      petDetails: formattedPetDetails,
      homeAddress
    });
    
    if (isBookingConfirmed) {
      // Will navigate automatically due to useEffect
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment with ${groomer.salon_name} has been scheduled`,
        variant: "default"
      });
    }
  };
  
  // Navigate back to groomer page  
  const handleBack = () => {
    navigate(`/pet-grooming/groomer/${id}`);
  };
  
  // If booking is confirmed, show success message and option to go back
  if (isBookingConfirmed) {
    return (
      <div className="min-h-screen bg-white">
        <GroomingHeader />
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-8">
                Your appointment with {groomer.salon_name} has been scheduled for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Appointment Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{format(selectedDate, 'MMMM d, yyyy')}</p>
                          <p className="text-sm text-gray-500">{selectedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <span className="text-green-600 text-xs font-bold">₹</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">₹{totalPrice.toFixed(0)}</p>
                          <p className="text-sm text-gray-500">
                            {selectedPackage ? selectedPackage.name : 'Standard Grooming'} 
                            {selectedServiceType === 'home' && ' + Home Visit'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Groomer Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={groomer.profile_image_url || 'https://via.placeholder.com/40'} 
                            alt={groomer.salon_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{groomer.salon_name}</p>
                          <p className="text-sm text-gray-500">{groomer.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white border border-green-500 text-green-600 hover:bg-green-50"
                  onClick={handleBack}
                >
                  Back to Groomer
                </Button>
                <Button 
                  onClick={() => navigate('/pet-grooming')}
                >
                  Book Another Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GroomingHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button 
          onClick={handleBack}
          className="mb-6 inline-flex items-center text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to groomer</span>
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-600">Complete your booking with {groomer.salon_name}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left column - Groomer info */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img 
                        src={groomer.profile_image_url || 'https://via.placeholder.com/64'} 
                        alt={groomer.salon_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{groomer.salon_name}</h2>
                      <p className="text-sm text-gray-500">{groomer.experience_years}+ years experience</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Selected Service</h3>
                      <p className="font-medium text-gray-900">
                        {selectedPackage ? selectedPackage.name : 'Standard Grooming'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedServiceType === 'salon' ? 'Salon Visit' : 'Home Visit'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Price</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">₹{totalPrice.toFixed(0)}</span>
                        <span className="text-xs text-gray-500">(incl. 18% GST)</span>
                      </div>
                    </div>
                    
                    {selectedPackage && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Package Details</h3>
                        <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right column - Booking form */}
              <div className="md:col-span-2">
                <div className="space-y-6">
                  {/* Service type */}
                  <div>
                    <h3 className="text-md font-semibold mb-3">Service Type</h3>
                    <ServiceTypeSelection 
                      selectedType={selectedServiceType}
                      onChange={setSelectedServiceType}
                      groomerProvidesSalon={groomer.provides_salon_service}
                      groomerProvidesHome={groomer.provides_home_service}
                      isProcessing={isProcessing}
                      serviceOptions={{
                        salon: { 
                          type: 'salon', 
                          additionalCost: 0, 
                          selected: selectedServiceType === 'salon' 
                        },
                        home: { 
                          type: 'home', 
                          additionalCost: groomer.home_service_cost, 
                          selected: selectedServiceType === 'home' 
                        }
                      }}
                    />
                  </div>
                  
                  {/* Date and time */}
                  <div>
                    <h3 className="text-md font-semibold mb-3">Date & Time</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                          Select Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            min={format(new Date(), 'yyyy-MM-dd')}
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => {
                              const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                              if (isValid(date)) {
                                setSelectedDate(date);
                              }
                            }}
                            className="bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Time Slot
                        </label>
                        <TimeSlotSelector 
                          selectedTime={selectedTime} 
                          onTimeSelect={setSelectedTime}
                          isProcessing={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Pet details */}
                  <div>
                    <h3 className="text-md font-semibold mb-3">Pet Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
                          Pet Name*
                        </label>
                        <input
                          type="text"
                          id="petName"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder="Enter your pet's name"
                          className="bg-white border border-gray-300 rounded-md py-2 px-3 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="petType" className="block text-sm font-medium text-gray-700 mb-1">
                          Pet Type*
                        </label>
                        <select
                          id="petType"
                          value={petType}
                          onChange={(e) => setPetType(e.target.value)}
                          className="bg-white border border-gray-300 rounded-md py-2 px-3 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          <option value="">Select pet type</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="petDetails" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Details (optional)
                      </label>
                      <textarea
                        id="petDetails"
                        value={petDetails}
                        onChange={(e) => setPetDetails(e.target.value)}
                        placeholder="Breed, age, specific needs, etc."
                        rows={3}
                        className="bg-white border border-gray-300 rounded-md py-2 px-3 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  {/* Home address (if home service selected) */}
                  {selectedServiceType === 'home' && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Home Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address*
                          </label>
                          <input
                            type="text"
                            id="streetAddress"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="House/Flat No., Building Name, Street"
                            className="bg-white border border-gray-300 rounded-md py-2 px-3 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                              City*
                            </label>
                            <input
                              type="text"
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="City"
                              className="bg-white border border-gray-300 rounded-md py-2 px-3 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                              Pincode*
                            </label>
                            <input
                              type="text"
                              id="pincode"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="Pincode"
                              maxLength={6}
                              className="bg-white border border-gray-300 rounded-md py-2 px-3 block w-full focus:outline-none focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Package selection */}
                  <div>
                    <h3 className="text-md font-semibold mb-3">Package Selection</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="standard"
                          name="package"
                          type="radio"
                          checked={!selectedPackage}
                          onChange={() => setSelectedPackage(null)}
                          className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                        />
                        <label htmlFor="standard" className="ml-3 block">
                          <span className="text-sm font-medium text-gray-900">Standard Grooming</span>
                          <span className="block text-sm text-gray-500">Basic grooming service - ₹{groomer.price}</span>
                        </label>
                      </div>
                      
                      {packages.map((pkg) => (
                        <div key={pkg.id} className="flex items-center">
                          <input
                            id={pkg.id}
                            name="package"
                            type="radio"
                            checked={selectedPackage?.id === pkg.id}
                            onChange={() => setSelectedPackage(pkg)}
                            className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                          />
                          <label htmlFor={pkg.id} className="ml-3 block">
                            <span className="text-sm font-medium text-gray-900">{pkg.name}</span>
                            <span className="block text-sm text-gray-500">{pkg.description} - ₹{pkg.price}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Note about payment */}
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Payment Information</h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        You'll be prompted to make a payment after confirming your booking. We accept all major credit cards.
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={handleConfirm}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
