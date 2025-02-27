
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Home, Store, ArrowLeft, Calendar, User, Info, Share2 } from "lucide-react";
import { useState } from "react";
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

export default function GroomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [petDetails, setPetDetails] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);

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

        if (error) {
          toast({
            title: "Booking Failed",
            description: "Unable to complete your booking. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Booking Confirmed!",
          description: `Your grooming appointment has been booked with ${groomer.salon_name}`,
        });
        
        setIsBookingOpen(false);
        setBookingDate("");
        setBookingTime("");
        setPetDetails("");
        setSelectedPackage(null);
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: "#9b87f5",
      },
    };

    // @ts-ignore - Razorpay is loaded from CDN
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with transparent background and larger logo */}
      <div className="bg-transparent absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
                alt="Petsu" 
                className="h-12 md:h-16"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShareGroomer}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:py-8 max-w-3xl mx-auto mt-16">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-48 sm:h-64 relative">
            <img
              src={groomer.profile_image_url || defaultImage}
              alt={groomer.salon_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent"></div>
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium">4.5</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">{groomer.salon_name}</h1>
              <div className="flex flex-col md:items-end">
                <div className="flex items-center mb-2">
                  <p className="font-semibold text-lg text-[#9b87f5] mr-2">
                    ₹{priceDetails.totalAmount.toFixed(0)}
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Info className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-60">
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
                <Button 
                  onClick={() => setIsBookingOpen(true)}
                  className="md:w-auto w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{groomer.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Scissors className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{groomer.experience_years}+ years experience</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {groomer.provides_salon_service && (
                  <div className="flex items-center text-[#7E69AB] bg-[#E5DEFF] px-3 py-1 rounded-full">
                    <Store className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Salon Service Available</span>
                  </div>
                )}
                {groomer.provides_home_service && (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Home Service Available</span>
                  </div>
                )}
              </div>

              {/* Grooming Packages Section */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Grooming Packages</h2>
                {packages.length === 0 ? (
                  <p className="text-gray-500 italic">No packages available</p>
                ) : (
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <Card 
                        key={pkg.id} 
                        className={`border ${selectedPackage?.id === pkg.id ? 'border-[#9b87f5] bg-[#E5DEFF]' : 'border-gray-200'} hover:border-[#9b87f5] transition-all`}
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
                                  <PopoverContent side="right" className="w-72">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">{pkg.name}</h4>
                                      <p className="text-sm text-gray-600">{pkg.description}</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <p className="text-[#9b87f5] font-semibold mt-1">₹{pkg.price}</p>
                            </div>
                            <Button 
                              variant={selectedPackage?.id === pkg.id ? "default" : "outline"} 
                              size="sm"
                              className={selectedPackage?.id === pkg.id ? "bg-[#9b87f5] hover:bg-[#7E69AB]" : ""}
                              onClick={() => setSelectedPackage(pkg)}
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
                <Card className={`mt-3 border ${!selectedPackage ? 'border-[#9b87f5] bg-[#E5DEFF]' : 'border-gray-200'} hover:border-[#9b87f5] transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-medium">Standard Grooming</h3>
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">Basic</Badge>
                          <Popover>
                            <PopoverTrigger>
                              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                            </PopoverTrigger>
                            <PopoverContent side="right" className="w-72">
                              <div className="space-y-2">
                                <h4 className="font-medium">Standard Grooming</h4>
                                <p className="text-sm text-gray-600">
                                  Basic grooming service includes bath, brushing, nail trimming, ear cleaning, and a basic haircut.
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-[#9b87f5] font-semibold mt-1">₹{groomer.price}</p>
                      </div>
                      <Button 
                        variant={!selectedPackage ? "default" : "outline"} 
                        size="sm"
                        className={!selectedPackage ? "bg-[#9b87f5] hover:bg-[#7E69AB]" : ""}
                        onClick={() => setSelectedPackage(null)}
                      >
                        {!selectedPackage ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {groomer.specializations.map((specialization: string) => (
                    <span
                      key={specialization}
                      className="px-3 py-1 bg-[#E5DEFF] text-[#7E69AB] rounded-full text-sm"
                    >
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>

              {groomer.bio && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{groomer.bio}</p>
                </div>
              )}
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
      </div>
    </div>
  );
}
