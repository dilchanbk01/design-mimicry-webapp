
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, sendConfirmationEmail, calculateTotalPrice } from "../utils/booking";
import type { GroomingPackage } from "../types/packages";
import type { GroomerProfile } from "../types";

export function useBooking(groomer: GroomerProfile | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

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

      // Create booking
      const data = await createBooking({
        groomerId: groomer.id,
        userId: user.id,
        selectedDate,
        selectedTime,
        selectedPackage,
        petDetails,
        serviceType: selectedServiceType,
        homeAddress,
        additionalCost: selectedServiceType === 'home' ? groomer.home_service_cost : 0
      });

      // Send confirmation email if user has an email
      if (user.email) {
        const totalPrice = calculateTotalPrice(
          selectedPackage ? selectedPackage.price : groomer.price, 
          selectedServiceType, 
          groomer.home_service_cost
        );
        
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
          // Log but don't interrupt the flow for email errors
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
