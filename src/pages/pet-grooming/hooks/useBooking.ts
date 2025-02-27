
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, sendConfirmationEmail, calculateTotalPrice } from "../utils/booking";
import type { GroomingPackage } from "../types/packages";
import type { GroomerProfile } from "../types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export function useBooking(groomer: GroomerProfile | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // Load Razorpay script function similar to what's working in EventBookingSection
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

  const handleBookingConfirm = async ({
    selectedDate,
    selectedTime,
    selectedServiceType,
    selectedPackage,
    petDetails,
    homeAddress
  }: {
    selectedDate: Date;
    selectedTime: string;
    selectedServiceType: 'salon' | 'home';
    selectedPackage: GroomingPackage | null;
    petDetails: string;
    homeAddress: string;
  }) => {
    if (!groomer) return;
    
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

      // Calculate total amount
      const basePrice = selectedPackage ? selectedPackage.price : groomer.price;
      const additionalCost = selectedServiceType === 'home' ? groomer.home_service_cost : 0;
      const subtotal = basePrice + additionalCost;
      const gstAmount = subtotal * 0.18; // 18% GST
      const totalAmount = subtotal + gstAmount;

      // Load the Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast({
          title: "Error",
          description: "Payment system failed to load",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: "rzp_test_5wYJG4Y7jeVhsz", // Using the same key that works in EventBookingSection
        amount: totalAmount * 100, // Amount in paise
        currency: "INR",
        name: "Petsu",
        description: `Grooming Service with ${groomer.salon_name}`,
        image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
        handler: async function (response: any) {
          try {
            // Create booking with payment information
            await createBooking({
              groomerId: groomer.id,
              userId: user.id,
              selectedDate,
              selectedTime,
              selectedPackage,
              petDetails,
              serviceType: selectedServiceType,
              homeAddress,
              additionalCost,
              payment_id: response.razorpay_payment_id
            });

            // Send confirmation email if user has an email
            if (user.email) {
              try {
                await sendConfirmationEmail(
                  user.email,
                  groomer.id,
                  groomer.salon_name,
                  groomer.address,
                  selectedDate,
                  selectedTime,
                  selectedPackage ? selectedPackage.name : 'Standard Grooming',
                  selectedServiceType,
                  homeAddress,
                  totalAmount
                );
              } catch (emailError) {
                console.error("Email error:", emailError);
                toast({
                  title: "Email Notification",
                  description: "We couldn't send you a confirmation email, but your booking is confirmed.",
                  variant: "default",
                });
              }
            }

            setIsBookingConfirmed(true);
            toast({
              title: "Booking Confirmed!",
              description: `Your grooming appointment with ${groomer.salon_name} has been booked.`,
            });
            
            // Redirect to profile page after successful booking
            navigate("/profile");
          } catch (error) {
            console.error("Error creating booking:", error);
            toast({
              title: "Booking Failed",
              description: "Unable to complete your booking. Please try again later.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: user.email,
          contact: "",
        },
        theme: {
          color: "#00D26A",
        },
        modal: {
          ondismiss: function() {
            console.log("Payment dismissed");
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the payment process.",
              variant: "default",
            });
          }
        }
      };

      // Initialize Razorpay payment
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
    
    return isBookingConfirmed;
  };

  return {
    handleBookingConfirm,
    isProcessing,
    isBookingConfirmed,
    setIsBookingConfirmed
  };
}
