
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

  const initializePayment = async (amount: number, orderData: any) => {
    // Load Razorpay script
    return new Promise<RazorpayResponse>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: 'rzp_test_dxbW3VfBytQz5L', // Replace with your Razorpay key
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          name: 'Petsu Grooming',
          description: 'Grooming Service Payment',
          image: "/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png",
          handler: function (response: RazorpayResponse) {
            resolve(response);
          },
          prefill: {
            name: 'Customer',
            email: orderData.email
          },
          theme: {
            color: '#4CAF50'
          },
          modal: {
            ondismiss: function() {
              reject(new Error("Payment cancelled by user"));
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay SDK"));
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
      const totalPrice = calculateTotalPrice(
        selectedPackage ? selectedPackage.price : groomer.price, 
        selectedServiceType, 
        groomer.home_service_cost
      );

      // For free/testing purposes, skip payment and directly create booking
      try {
        // Create a dummy payment ID for testing purposes
        const paymentId = `pay_test_${Date.now()}`;

        // Create booking with the dummy payment information
        await createBooking({
          groomerId: groomer.id,
          userId: user.id,
          selectedDate,
          selectedTime,
          selectedPackage,
          petDetails,
          serviceType: selectedServiceType,
          homeAddress,
          additionalCost: selectedServiceType === 'home' ? groomer.home_service_cost : 0,
          payment_id: paymentId
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
              totalPrice
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
      } catch (bookingError: any) {
        console.error("Booking error:", bookingError);
        toast({
          title: "Booking Failed",
          description: bookingError.message || "There was an error processing your booking. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
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
