
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGroomer } from "./hooks/useGroomer";
import { calculatePriceDetails } from "./utils/pricing";
import { GroomerHeader } from "./components/GroomerHeader";
import { GroomerImageBanner } from "./components/GroomerImageBanner";
import { GroomerTitle } from "./components/GroomerTitle";
import { GroomerSpecializations } from "./components/GroomerSpecializations";
import { GroomerServices } from "./components/GroomerServices";
import { PriceDisplay } from "./components/PriceDisplay";
import { BookAppointmentButton } from "./components/BookAppointmentButton";
import { GroomerPackages } from "./components/GroomerPackages";
import { GroomerBio } from "./components/GroomerBio";
import { GroomerInfo } from "./components/GroomerInfo";
import { BookingDialog } from "./components/BookingDialog";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { ServiceTypeSelection } from "./components/ServiceTypeSelection";
import type { GroomingPackage, ServiceOption } from "./types/packages";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function GroomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [petDetails, setPetDetails] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<{
    salon: ServiceOption;
    home: ServiceOption;
  }>({
    salon: { type: 'salon', additionalCost: 0, selected: true },
    home: { type: 'home', additionalCost: 0, selected: false }
  });
  
  const { groomer, packages, isLoading } = useGroomer(id);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize service options when groomer data is loaded
  useEffect(() => {
    if (groomer) {
      // Get home service cost from groomer profile
      const homeServiceCost = groomer.home_service_cost || 100; // Default to 100 if not set

      // If groomer doesn't provide salon service but provides home service,
      // default to home service
      if (!groomer.provides_salon_service && groomer.provides_home_service) {
        setServiceOptions({
          salon: { type: 'salon', additionalCost: 0, selected: false },
          home: { type: 'home', additionalCost: homeServiceCost, selected: true }
        });
      } else {
        setServiceOptions({
          salon: { type: 'salon', additionalCost: 0, selected: true },
          home: { type: 'home', additionalCost: homeServiceCost, selected: false }
        });
      }
    }
  }, [groomer]);

  const handleSelectServiceType = (type: 'salon' | 'home') => {
    setServiceOptions({
      salon: { 
        ...serviceOptions.salon,
        selected: type === 'salon'
      },
      home: { 
        ...serviceOptions.home,
        selected: type === 'home'
      }
    });

    // Clear home address if salon is selected
    if (type === 'salon') {
      setHomeAddress("");
    }
  };

  // Function to send confirmation email to the customer
  const sendConfirmationEmail = async (userEmail: string, bookingDetails: any) => {
    try {
      // Call the send_booking_confirmation function which is available in the database
      const { data, error } = await supabase.rpc('send_booking_confirmation');

      // We still use our Edge Function for the actual email sending
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: userEmail,
          subject: "Your Grooming Appointment is Confirmed!",
          htmlContent: "",
          bookingType: "grooming",
          bookingDetails: {
            groomerName: groomer?.salon_name,
            date: bookingDate,
            time: bookingTime,
            serviceName: selectedPackage ? selectedPackage.name : "Standard Grooming",
            serviceType: serviceOptions.home.selected ? "Home Visit" : "At Salon",
            address: serviceOptions.home.selected ? homeAddress : groomer?.address,
            petDetails: petDetails
          }
        }
      });

      if (error) {
        console.error("Error in booking confirmation process:", error);
      } else {
        console.log("Confirmation email process initiated successfully");
      }
    } catch (err) {
      console.error("Exception when sending confirmation email:", err);
    }
  };

  // Function to send notification email to the groomer
  const sendGroomerNotification = async (userData: any, bookingDetails: any) => {
    try {
      // Get groomer email - we'd need a data structure to store this or fetch it from the database
      const { data: groomerData, error: groomerError } = await supabase
        .from("groomer_profiles")
        .select("user_id")
        .eq("id", groomer?.id)
        .single();

      if (groomerError || !groomerData) {
        console.error("Error fetching groomer user ID:", groomerError);
        return;
      }

      // Get groomer's email from auth
      const { data: groomerAuth, error: groomerAuthError } = await supabase.auth
        .admin.getUserById(groomerData.user_id);

      if (groomerAuthError || !groomerAuth || !groomerAuth.user || !groomerAuth.user.email) {
        console.error("Error fetching groomer email:", groomerAuthError);
        return;
      }

      const groomerEmail = groomerAuth.user.email;

      // Send notification to groomer using edge function
      await supabase.functions.invoke('send-groomer-notification', {
        body: {
          groomerEmail: groomerEmail,
          groomerName: groomer?.salon_name || "Groomer",
          customerName: userData.name || "Customer",
          customerEmail: userData.email || "",
          customerPhone: userData.phone || null,
          date: bookingDate,
          time: bookingTime,
          serviceName: selectedPackage ? selectedPackage.name : "Standard Grooming",
          serviceType: serviceOptions.home.selected ? "Home Visit" : "At Salon",
          address: serviceOptions.home.selected ? homeAddress : groomer?.address || "",
          petDetails: petDetails
        }
      });

      console.log("Groomer notification sent successfully");
    } catch (err) {
      console.error("Exception when sending groomer notification:", err);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      localStorage.setItem('redirectAfterAuth', location.pathname);
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this appointment.",
      });
      navigate("/auth");
      return;
    }

    if (!groomer) return;

    // Validate home address for home service
    if (serviceOptions.home.selected && !homeAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please provide your address for the home service.",
        variant: "destructive",
      });
      return;
    }

    setPaymentProcessing(true);

    try {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay SDK failed to load");
      }

      // Use selected package price or default groomer price
      const basePrice = selectedPackage ? selectedPackage.price : groomer.price;
      
      // Add additional cost for home service if selected
      const additionalCost = serviceOptions.home.selected ? serviceOptions.home.additionalCost : 0;
      
      // Calculate total price with GST
      const { totalAmount } = calculatePriceDetails(basePrice, additionalCost);
      
      // Convert to paise for Razorpay
      const priceInPaise = totalAmount * 100;

      // Get user profile data for notification
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user profile:", userError);
      }

      const options = {
        key: "rzp_test_5wYJG4Y7jeVhsz", 
        amount: priceInPaise,
        currency: "INR",
        name: "Petsu",
        description: `Grooming appointment with ${groomer.salon_name}${selectedPackage ? ` - ${selectedPackage.name}` : ''}`,
        image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
        handler: async function (response: any) {
          try {
            const booking = {
              groomer_id: groomer.id,
              user_id: user.id,
              date: bookingDate,
              time: bookingTime,
              pet_details: petDetails,
              payment_id: response.razorpay_payment_id,
              status: 'confirmed',
              service_type: serviceOptions.home.selected ? 'home' : 'salon',
              package_id: selectedPackage?.id || null,
              home_address: serviceOptions.home.selected ? homeAddress : null,
              additional_cost: serviceOptions.home.selected ? serviceOptions.home.additionalCost : 0
            };

            const { error } = await supabase
              .from("grooming_bookings")
              .insert(booking);

            if (error) throw error;

            // Send confirmation email to customer
            if (user.email) {
              await sendConfirmationEmail(user.email, {
                groomerName: groomer.salon_name,
                date: bookingDate,
                time: bookingTime,
                serviceName: selectedPackage ? selectedPackage.name : "Standard Grooming",
                serviceType: serviceOptions.home.selected ? "Home Visit" : "At Salon"
              });
            }

            // Send notification to groomer
            await sendGroomerNotification({
              email: user.email,
              name: userData?.full_name || user.email,
              phone: userData?.phone_number
            }, {
              groomerName: groomer.salon_name,
              date: bookingDate,
              time: bookingTime,
              serviceName: selectedPackage ? selectedPackage.name : "Standard Grooming",
              serviceType: serviceOptions.home.selected ? "Home Visit" : "At Salon"
            });

            // Show success animation
            setShowConfirmation(true);
            
            // Hide dialog and reset form
            setIsBookingOpen(false);
            
            // Hide confirmation after 3 seconds
            setTimeout(() => {
              setShowConfirmation(false);
              setBookingDate("");
              setBookingTime("");
              setPetDetails("");
              setHomeAddress("");
              setSelectedPackage(null);
              
              toast({
                title: "Booking Confirmed!",
                description: `Your grooming appointment has been booked with ${groomer.salon_name}`,
              });
            }, 3000);
          } catch (error) {
            console.error('Error saving booking:', error);
            toast({
              title: "Booking Failed",
              description: "Unable to complete your booking. Please try again.",
              variant: "destructive",
            });
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#00C853",
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to initialize payment. Please try again later.",
        variant: "destructive",
      });
      setPaymentProcessing(false);
    }
  };

  // Calculate price with home service additional cost if applicable
  const selectedPrice = selectedPackage ? selectedPackage.price : groomer?.price || 0;
  const additionalCost = serviceOptions.home.selected ? serviceOptions.home.additionalCost : 0;
  const priceDetails = calculatePriceDetails(selectedPrice, additionalCost);

  if (isLoading || !groomer) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-60 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const defaultImage = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="min-h-screen bg-white">
      <GroomerHeader />
      <GroomerImageBanner 
        imageUrl={groomer.profile_image_url} 
        altText={groomer.salon_name} 
      />

      <div className="px-4 py-6">
        <GroomerTitle title={groomer.salon_name} />

        <div className="space-y-6 bg-white rounded-xl p-4 shadow-sm">
          <GroomerSpecializations specializations={groomer.specializations} />
          <GroomerServices 
            providesSalonService={groomer.provides_salon_service} 
            providesHomeService={groomer.provides_home_service} 
          />
          
          {/* Booking Section */}
          <div className="flex flex-col items-center">
            <PriceDisplay priceDetails={priceDetails} />
            <BookAppointmentButton 
              onClick={() => setIsBookingOpen(true)} 
              isProcessing={paymentProcessing} 
            />
          </div>

          {/* Service Type Selection */}
          <ServiceTypeSelection
            groomerProvidesSalon={groomer.provides_salon_service}
            groomerProvidesHome={groomer.provides_home_service}
            serviceOptions={serviceOptions}
            onSelectServiceType={handleSelectServiceType}
            homeAddress={homeAddress}
            onHomeAddressChange={setHomeAddress}
            isProcessing={paymentProcessing}
          />

          <GroomerPackages 
            packages={packages} 
            selectedPackage={selectedPackage} 
            onSelectPackage={setSelectedPackage} 
            groomerPrice={groomer.price}
            isProcessing={paymentProcessing}
          />

          <GroomerBio bio={groomer.bio} />
          <GroomerInfo 
            experienceYears={groomer.experience_years} 
            address={groomer.address} 
          />
        </div>
      </div>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        selectedPartner={{
          id: groomer.id,
          name: groomer.salon_name,
          rating: 4.5,
          location: groomer.address,
          experience: `${groomer.experience_years}+ years experience`,
          price: selectedPackage 
            ? `₹${selectedPackage.price} - ${selectedPackage.name}` 
            : `₹${groomer.price} - Standard Grooming`,
          image: groomer.profile_image_url || defaultImage,
          providesHomeService: groomer.provides_home_service,
          providesSalonService: groomer.provides_salon_service
        }}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        petDetails={petDetails}
        homeAddress={homeAddress}
        isHomeService={serviceOptions.home.selected}
        priceDetails={priceDetails}
        onDateChange={setBookingDate}
        onTimeChange={setBookingTime}
        onPetDetailsChange={setPetDetails}
        onHomeAddressChange={setHomeAddress}
        onSubmit={handleBookingSubmit}
      />

      <BookingConfirmation 
        show={showConfirmation}
        groomerName={groomer.salon_name}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
      />
    </div>
  );
}
