
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { GroomingHeader } from "./components/GroomingHeader";
import { BookingDialog } from "./components/BookingDialog";
import { GroomerTitle } from "./components/GroomerTitle";
import { GroomerBio } from "./components/GroomerBio";
import { GroomerServices } from "./components/GroomerServices";
import { GroomerInfo } from "./components/GroomerInfo";
import { GroomerPackages } from "./components/GroomerPackages";
import { GroomerSpecializations } from "./components/GroomerSpecializations";
import { GroomerImageBanner } from "./components/GroomerImageBanner";
import { ServiceTypeSelection } from "./components/ServiceTypeSelection";
import { PriceDisplay } from "./components/PriceDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useGroomer } from "./hooks/useGroomer";
import { Instagram, Linkedin } from "lucide-react";
import type { GroomingPackage } from "./types/packages";
import type { GroomerProfile } from "./types";

export default function GroomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { groomer, packages, isLoading } = useGroomer(id);
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<'salon' | 'home'>('salon');
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [petDetails, setPetDetails] = useState<string>("");
  const [homeAddress, setHomeAddress] = useState<string>("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
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
            <Button onClick={() => navigate("/pet-grooming")}>
              Back to Pet Grooming
            </Button>
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

  const handleBookingDialogOpen = () => {
    // Set default package if none selected
    if (!selectedPackage && packages.length > 0) {
      setSelectedPackage(packages[0]);
    }
    setIsBookingOpen(true);
  };

  const calculateTotalPrice = () => {
    const basePrice = selectedPackage ? selectedPackage.price : groomer.price;
    
    // Add home service cost if home service is selected
    let totalPrice = basePrice;
    if (selectedServiceType === 'home' && groomer.home_service_cost) {
      totalPrice += groomer.home_service_cost;
    }
    
    return totalPrice;
  };

  // Function to send confirmation email
  const sendConfirmationEmail = async (userEmail: string) => {
    if (!groomer) return;
    
    try {
      const totalPrice = calculateTotalPrice();
      const serviceName = selectedPackage ? selectedPackage.name : 'Standard Grooming';
      
      const response = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: userEmail,
          subject: `Your Grooming Appointment with ${groomer.salon_name} is Confirmed`,
          bookingType: "grooming",
          bookingDetails: {
            groomerName: groomer.salon_name,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            serviceName: serviceName,
            serviceType: selectedServiceType,
            address: selectedServiceType === 'home' ? homeAddress : groomer.address,
            price: totalPrice
          }
        }
      });

      console.log("Email confirmation response:", response);
    } catch (err) {
      console.error("Error sending confirmation email:", err);
      // We don't want to interrupt the booking flow if email fails
      toast({
        title: "Email Notification",
        description: "We couldn't send you a confirmation email, but your booking is confirmed.",
        variant: "default",
      });
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleBookingConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Incomplete information",
        description: "Please select a date and time.",
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

    try {
      setIsProcessing(true);

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book a grooming appointment.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const totalPrice = calculateTotalPrice();

      // Initialize payment if price > 0
      if (totalPrice > 0) {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast({
            title: "Payment Error",
            description: "Unable to load payment system. Please try again later.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Create Razorpay order
        const options = {
          key: "rzp_test_5wYJG4Y7jeVhsz",
          amount: totalPrice * 100, // Amount in paise
          currency: "INR",
          name: groomer.salon_name,
          description: `Grooming appointment: ${selectedPackage ? selectedPackage.name : 'Standard Grooming'}`,
          image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
          handler: async function(response: any) {
            try {
              // Create booking record with payment ID
              const { data, error } = await supabase
                .from('grooming_bookings')
                .insert({
                  groomer_id: groomer.id,
                  user_id: user.id,
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  time: selectedTime,
                  package_id: selectedPackage?.id,
                  pet_details: petDetails,
                  service_type: selectedServiceType,
                  home_address: selectedServiceType === 'home' ? homeAddress : null,
                  additional_cost: selectedServiceType === 'home' ? groomer.home_service_cost : 0,
                  status: 'confirmed',
                  payment_id: response.razorpay_payment_id
                })
                .select()
                .single();

              if (error) throw error;

              // Send confirmation email if user has an email
              if (user.email) {
                await sendConfirmationEmail(user.email);
              }

              setIsBookingConfirmed(true);
              toast({
                title: "Booking Confirmed!",
                description: `Your grooming appointment with ${groomer.salon_name} has been booked.`,
              });
            } catch (error) {
              console.error("Payment processing error:", error);
              toast({
                title: "Booking Failed",
                description: "There was an error processing your booking. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: user.user_metadata?.full_name || "",
            email: user.email || "",
            contact: ""
          },
          theme: {
            color: "#00D26A"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        // Open Razorpay
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Free service - no payment required
        const { data, error } = await supabase
          .from('grooming_bookings')
          .insert({
            groomer_id: groomer.id,
            user_id: user.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            package_id: selectedPackage?.id,
            pet_details: petDetails,
            service_type: selectedServiceType,
            home_address: selectedServiceType === 'home' ? homeAddress : null,
            additional_cost: selectedServiceType === 'home' ? groomer.home_service_cost : 0,
            status: 'confirmed'
          })
          .select()
          .single();

        if (error) throw error;

        // Send confirmation email if user has an email
        if (user.email) {
          await sendConfirmationEmail(user.email);
        }

        setIsBookingConfirmed(true);
        toast({
          title: "Booking Confirmed!",
          description: `Your grooming appointment with ${groomer.salon_name} has been booked.`,
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
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
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-green-800">Book an Appointment</h2>
                
                {/* Service Type Selection with reduced size */}
                {groomer.provides_salon_service && groomer.provides_home_service && (
                  <div className="mb-4">
                    <ServiceTypeSelection
                      selectedType={selectedServiceType}
                      onChange={handleServiceTypeChange}
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
                    basePrice={selectedPackage ? selectedPackage.price : groomer.price} 
                    homeServiceCost={groomer.home_service_cost} 
                    serviceType={selectedServiceType}
                  />
                </div>

                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleBookingDialogOpen}
                >
                  Book Now
                </Button>
              </div>
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
          providesSalonService: groomer.provides_salon_service
        }}
        packages={packages}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedPackage={selectedPackage}
        selectedServiceType={selectedServiceType}
        petDetails={petDetails}
        homeAddress={homeAddress}
        isBookingConfirmed={isBookingConfirmed}
        totalPrice={calculateTotalPrice()}
        isProcessing={isProcessing}
        
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        onPackageChange={setSelectedPackage}
        onServiceTypeChange={handleServiceTypeChange}
        onPetDetailsChange={setPetDetails}
        onHomeAddressChange={setHomeAddress}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}
