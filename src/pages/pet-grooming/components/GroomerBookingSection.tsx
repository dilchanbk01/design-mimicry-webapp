
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Scissors, Info, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateTotalPrice } from "../utils/booking";
import type { GroomingPackage } from "../types/packages";
import type { GroomerProfile } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface GroomerBookingSectionProps {
  groomer: GroomerProfile;
  packages: GroomingPackage[];
  selectedServiceType: 'salon' | 'home';
  onServiceTypeChange: (serviceType: 'salon' | 'home') => void;
  onBookingComplete: () => void;
}

export function GroomerBookingSection({
  groomer,
  packages,
  selectedServiceType,
  onServiceTypeChange,
  onBookingComplete
}: GroomerBookingSectionProps) {
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GroomingPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [petDetails, setPetDetails] = useState<string>('');
  const [homeAddress, setHomeAddress] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Calculate prices
  const basePrice = selectedPackage ? selectedPackage.price : groomer.price;
  const homeServiceCost = selectedServiceType === 'home' ? groomer.home_service_cost : 0;
  const totalPrice = calculateTotalPrice(basePrice, selectedServiceType, groomer.home_service_cost);

  // Update home address when address fields change
  const updateHomeAddress = () => {
    const fullAddress = [
      streetAddress,
      city,
      pincode ? pincode : ""
    ].filter(Boolean).join(", ");
    
    setHomeAddress(fullAddress);
  };

  const handleProceedToBooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      localStorage.setItem('redirectAfterAuth', location.pathname);
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this groomer.",
      });
      navigate("/auth");
      return;
    }

    setShowBookingForm(true);
  };

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Incomplete Information",
        description: "Please select a date and time for your appointment.",
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

    if (!petDetails) {
      toast({
        title: "Pet Details Required",
        description: "Please provide details about your pet.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      localStorage.setItem('redirectAfterAuth', location.pathname);
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this groomer.",
      });
      navigate("/auth");
      return;
    }

    try {
      setBookingInProgress(true);
      
      // Load the Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast({
          title: "Error",
          description: "Payment system failed to load",
          variant: "destructive",
        });
        setBookingInProgress(false);
        return;
      }

      const options = {
        key: "rzp_test_dxbW3VfBytQz5L",
        amount: totalPrice * 100,
        currency: "INR",
        name: "Petsu Grooming",
        description: `Grooming appointment with ${groomer.salon_name}`,
        image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
        handler: async function (response: any) {
          try {
            const appointmentDate = new Date(selectedDate);
            
            const { data, error } = await supabase
              .from('grooming_bookings')
              .insert({
                groomer_id: groomer.id,
                user_id: user.id,
                date: format(appointmentDate, 'yyyy-MM-dd'),
                time: selectedTime,
                package_id: selectedPackage?.id,
                pet_details: petDetails,
                service_type: selectedServiceType,
                home_address: selectedServiceType === 'home' ? homeAddress : null,
                additional_cost: selectedServiceType === 'home' ? groomer.home_service_cost : 0,
                payment_id: response.razorpay_payment_id,
                status: 'confirmed'
              })
              .select();

            if (error) throw error;
            
            // Send confirmation email
            if (user.email) {
              try {
                await supabase.functions.invoke('send-confirmation-email', {
                  body: {
                    to: user.email,
                    subject: `Your Grooming Appointment with ${groomer.salon_name} is Confirmed`,
                    bookingType: "grooming",
                    bookingDetails: {
                      groomerName: groomer.salon_name,
                      date: format(appointmentDate, 'yyyy-MM-dd'),
                      time: selectedTime,
                      serviceName: selectedPackage ? selectedPackage.name : 'Standard Grooming',
                      serviceType: selectedServiceType,
                      address: selectedServiceType === 'home' ? homeAddress : groomer.address,
                      price: totalPrice
                    }
                  }
                });
              } catch (emailError) {
                console.error("Email error:", emailError);
              }
            }

            toast({
              title: "Booking Successful!",
              description: `Your appointment with ${groomer.salon_name} has been confirmed.`,
            });
            
            setShowBookingForm(false);
            onBookingComplete();

          } catch (error) {
            console.error("Error booking appointment:", error);
            toast({
              title: "Booking Failed",
              description: "Unable to complete your booking. Please try again later.",
              variant: "destructive",
            });
          } finally {
            setBookingInProgress(false);
          }
        },
        prefill: {
          email: user.email,
          contact: "",
        },
        theme: {
          color: "#4CAF50",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Payment Error",
        description: "Unable to initiate payment. Please try again later.",
        variant: "destructive",
      });
      setBookingInProgress(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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

  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#4CAF50]">₹{basePrice}</span>
              {selectedServiceType === 'home' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    + ₹{homeServiceCost} (home service)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Total: ₹{totalPrice}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPriceBreakdown(true);
                  }}
                  className="p-0 h-auto hover:bg-transparent"
                >
                  <Info className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center text-sm mb-2">
            <Scissors className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">
              {selectedServiceType === 'home' ? 'Home Service' : 'Salon Service'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedServiceType === 'salon' ? "default" : "outline"}
              size="sm"
              onClick={() => onServiceTypeChange('salon')}
              className="text-xs"
              disabled={!groomer.provides_salon_service}
            >
              Salon Visit
            </Button>
            <Button
              variant={selectedServiceType === 'home' ? "default" : "outline"}
              size="sm"
              onClick={() => onServiceTypeChange('home')}
              className="text-xs"
              disabled={!groomer.provides_home_service}
            >
              Home Visit
            </Button>
          </div>
        </div>
      </div>
      
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleProceedToBooking();
        }}
        className="w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white"
      >
        Book Appointment
      </Button>

      <Dialog open={showPriceBreakdown} onOpenChange={setShowPriceBreakdown}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price Breakdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>₹{basePrice}</span>
            </div>
            {selectedServiceType === 'home' && (
              <div className="flex justify-between">
                <span>Home Service Fee</span>
                <span>₹{homeServiceCost}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Amount</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment with {groomer.salon_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  disabled={bookingInProgress}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={bookingInProgress}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Service Type</Label>
              <RadioGroup value={selectedServiceType} onValueChange={(value: 'salon' | 'home') => onServiceTypeChange(value)}>
                {groomer.provides_salon_service && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="salon" id="salon" disabled={bookingInProgress} />
                    <Label htmlFor="salon" className="cursor-pointer">Salon Visit</Label>
                  </div>
                )}
                {groomer.provides_home_service && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home" id="home" disabled={bookingInProgress} />
                    <Label htmlFor="home" className="cursor-pointer">Home Visit</Label>
                  </div>
                )}
              </RadioGroup>
            </div>
            
            {selectedServiceType === 'home' && (
              <div className="space-y-3">
                <Label>Your Address</Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="streetAddress" className="text-xs text-gray-500">Street Address</Label>
                    <Input
                      id="streetAddress"
                      placeholder="House/Flat No., Building Name, Street"
                      value={streetAddress}
                      onChange={(e) => {
                        setStreetAddress(e.target.value);
                        updateHomeAddress();
                      }}
                      disabled={bookingInProgress}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city" className="text-xs text-gray-500">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          updateHomeAddress();
                        }}
                        disabled={bookingInProgress}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-xs text-gray-500">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          updateHomeAddress();
                        }}
                        maxLength={6}
                        disabled={bookingInProgress}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="package">Select Package</Label>
              <RadioGroup 
                value={selectedPackage ? selectedPackage.id : "standard"} 
                onValueChange={(value) => {
                  const pkg = packages.find(p => p.id === value);
                  setSelectedPackage(pkg || null);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" disabled={bookingInProgress} />
                  <Label htmlFor="standard" className="cursor-pointer">
                    Standard Grooming (₹{groomer.price})
                  </Label>
                </div>
                
                {packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={pkg.id} id={pkg.id} disabled={bookingInProgress} />
                    <Label htmlFor={pkg.id} className="cursor-pointer">
                      {pkg.name} (₹{pkg.price})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="petDetails">Pet Details</Label>
              <Textarea
                id="petDetails"
                placeholder="Tell us about your pet (breed, age, specific needs)"
                value={petDetails}
                onChange={(e) => setPetDetails(e.target.value)}
                disabled={bookingInProgress}
                required
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <span className="block font-medium">Total:</span>
                <span className="text-sm text-gray-500">
                  {selectedServiceType === 'home' ? 'Including home service fee' : 'At salon'}
                </span>
              </div>
              <span className="text-xl font-bold text-green-600">₹{totalPrice}</span>
            </div>
            
            <Button 
              type="button" 
              className="w-full" 
              onClick={handlePayment}
              disabled={bookingInProgress}
            >
              {bookingInProgress ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
