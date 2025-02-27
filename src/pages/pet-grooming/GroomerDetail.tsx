
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Home, Store, ArrowLeft, Calendar, User, Info, Share2, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { BookingDialog } from "./components/BookingDialog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import type { GroomerProfile } from "./types";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GroomingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  groomer_id: string;
  created_at: string;
}

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
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: groomer } = useQuery<GroomerProfile>({
    queryKey: ['groomer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: packages = [] } = useQuery<GroomingPackage[]>({
    queryKey: ['groomer-packages', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grooming_packages')
        .select('*')
        .eq('groomer_id', id)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  const handleShareGroomer = async () => {
    const shareData = {
      title: groomer ? `${groomer.salon_name} - Pet Grooming` : 'Pet Grooming Service',
      text: groomer ? `Check out ${groomer.salon_name} for pet grooming services!` : 'Check out this pet grooming service!',
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "The groomer details have been shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard!",
        description: "You can now share it with your friends.",
      });
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

    setPaymentProcessing(true);

    try {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay SDK failed to load");
      }

      // Use selected package price or default groomer price
      const priceToCharge = selectedPackage ? selectedPackage.price : groomer.price;
      
      // Extract numeric price value and convert to paise for Razorpay
      const priceInPaise = priceToCharge * 100;

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
              service_type: groomer.provides_home_service ? 'home' : 'salon',
              package_id: selectedPackage?.id || null
            };

            const { error } = await supabase
              .from("grooming_bookings")
              .insert(booking);

            if (error) throw error;

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

  // Calculate GST and total amount
  const calculatePriceDetails = (basePrice: number) => {
    const gstRate = 0.18; // 18% GST
    const gstAmount = basePrice * gstRate;
    const totalAmount = basePrice + gstAmount;
    
    return {
      basePrice,
      gstAmount,
      totalAmount
    };
  };

  const selectedPrice = selectedPackage ? selectedPackage.price : groomer?.price || 0;
  const priceDetails = calculatePriceDetails(selectedPrice);

  if (!groomer) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-60 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const defaultImage = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="min-h-screen bg-green-50">
      {/* Transparent header with back button, logo, and profile icon */}
      <header className="absolute top-0 left-0 right-0 bg-transparent z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-green-600/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8 sm:h-10 cursor-pointer"
              onClick={() => navigate('/')}
            />

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-green-600/20"
                onClick={handleShareGroomer}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-green-600/20"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-width image at the top */}
      <div className="w-full h-72 md:h-96 relative">
        <img
          src={groomer.profile_image_url || defaultImage}
          alt={groomer.salon_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-transparent"></div>
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="ml-1 font-medium">4.5</span>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-green-800">{groomer.salon_name}</h1>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
              onClick={handleShareGroomer}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <Button 
              onClick={() => setIsBookingOpen(true)}
              className="md:w-auto w-full bg-green-600 hover:bg-green-700 mb-2"
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </>
              )}
            </Button>
            <div className="flex items-center">
              <p className="font-semibold text-lg text-green-600 mr-2">
                ₹{priceDetails.totalAmount.toFixed(0)}
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-gray-400 hover:text-green-600">
                    <Info className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-60 bg-white">
                  <div className="space-y-2">
                    <h4 className="font-medium">Price Breakdown</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>₹{priceDetails.basePrice.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>₹{priceDetails.gstAmount.toFixed(0)}</span>
                      </div>
                      <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                        <span>Total:</span>
                        <span>₹{priceDetails.totalAmount.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Specializations Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-800">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {groomer.specializations.map((specialization: string) => (
                <span
                  key={specialization}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {specialization}
                </span>
              ))}
            </div>
          </div>

          {/* Services Available */}
          <div className="flex flex-wrap gap-3">
            {groomer.provides_salon_service && (
              <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
                <Store className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">Salon Service Available</span>
              </div>
            )}
            {groomer.provides_home_service && (
              <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
                <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">Home Service Available</span>
              </div>
            )}
          </div>

          {/* Grooming Packages Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-800">Grooming Packages</h2>
            {packages.length === 0 ? (
              <p className="text-gray-500 italic">No packages available</p>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className={`border ${selectedPackage?.id === pkg.id ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-md font-medium">{pkg.name}</h3>
                            <Popover>
                              <PopoverTrigger>
                                <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                              </PopoverTrigger>
                              <PopoverContent side="right" className="w-72 bg-white">
                                <div className="space-y-2">
                                  <h4 className="font-medium">{pkg.name}</h4>
                                  <p className="text-sm text-gray-600">{pkg.description}</p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <p className="text-green-600 font-semibold mt-1">₹{pkg.price}</p>
                        </div>
                        <Button 
                          variant={selectedPackage?.id === pkg.id ? "default" : "outline"} 
                          size="sm"
                          className={selectedPackage?.id === pkg.id ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                          onClick={() => setSelectedPackage(pkg)}
                          disabled={paymentProcessing}
                        >
                          {selectedPackage?.id === pkg.id ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Standard service card */}
            <Card className={`mt-3 border ${!selectedPackage ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-medium">Standard Grooming</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Basic</Badge>
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent side="right" className="w-72 bg-white">
                          <div className="space-y-2">
                            <h4 className="font-medium">Standard Grooming</h4>
                            <p className="text-sm text-gray-600">
                              Basic grooming service includes bath, brushing, nail trimming, ear cleaning, and a basic haircut.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="text-green-600 font-semibold mt-1">₹{groomer.price}</p>
                  </div>
                  <Button 
                    variant={!selectedPackage ? "default" : "outline"} 
                    size="sm"
                    className={!selectedPackage ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                    onClick={() => setSelectedPackage(null)}
                    disabled={paymentProcessing}
                  >
                    {!selectedPackage ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {groomer.bio && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-green-800">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{groomer.bio}</p>
            </div>
          )}
          
          <div className="border-t border-green-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-green-600" />
                <span className="text-sm">{groomer.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Scissors className="h-5 w-5 mr-2 flex-shrink-0 text-green-600" />
                <span className="text-sm">{groomer.experience_years}+ years experience</span>
              </div>
            </div>
          </div>
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
        onDateChange={setBookingDate}
        onTimeChange={setBookingTime}
        onPetDetailsChange={setPetDetails}
        onSubmit={handleBookingSubmit}
      />

      {/* Confirmation Animation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-xl animate-scale-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-gray-600">
                Your appointment with {groomer.salon_name} has been successfully booked for {new Date(bookingDate).toLocaleDateString()} at {bookingTime}.
              </p>
              <p className="text-sm text-gray-500">
                You can view your appointment details in your profile.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
