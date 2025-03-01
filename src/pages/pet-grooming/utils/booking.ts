
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { GroomingPackage } from "../types/packages";

// Function to send confirmation email
export const sendConfirmationEmail = async (
  userEmail: string,
  groomerId: string,
  groomerName: string,
  groomerAddress: string,
  selectedDate: Date,
  selectedTime: string,
  serviceName: string,
  serviceType: 'salon' | 'home',
  homeAddress: string,
  totalPrice: number
) => {
  try {
    const response = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: userEmail,
        subject: `Your Grooming Appointment with ${groomerName} is Confirmed`,
        bookingType: "grooming",
        bookingDetails: {
          groomerName: groomerName,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          serviceName: serviceName,
          serviceType: serviceType,
          address: serviceType === 'home' ? homeAddress : groomerAddress,
          price: totalPrice
        }
      }
    });

    console.log("Email confirmation response:", response);
    return response;
  } catch (err) {
    console.error("Error sending confirmation email:", err);
    throw err;
  }
};

// Create booking in database
export const createBooking = async ({
  groomerId,
  userId,
  selectedDate,
  selectedTime,
  selectedPackage,
  petDetails,
  serviceType,
  homeAddress,
  additionalCost,
  payment_id,
}: {
  groomerId: string;
  userId: string;
  selectedDate: Date;
  selectedTime: string;
  selectedPackage: GroomingPackage | null;
  petDetails: string;
  serviceType: 'salon' | 'home';
  homeAddress: string;
  additionalCost: number;
  payment_id: string;
}) => {
  const { data, error } = await supabase
    .from('grooming_bookings')
    .insert({
      groomer_id: groomerId,
      user_id: userId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      package_id: selectedPackage?.id,
      pet_details: petDetails,
      service_type: serviceType,
      home_address: serviceType === 'home' ? homeAddress : null,
      additional_cost: additionalCost,
      payment_id: payment_id,
      status: 'confirmed'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Calculate total price
export const calculateTotalPrice = (
  basePrice: number,
  serviceType: 'salon' | 'home',
  homeServiceCost: number = 0
) => {
  let totalPrice = basePrice;
  if (serviceType === 'home') {
    totalPrice += homeServiceCost;
  }
  return totalPrice;
};
