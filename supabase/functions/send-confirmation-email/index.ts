
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface EmailRequest {
  to: string;
  subject: string;
  bookingType: string;
  bookingDetails: {
    groomerName?: string;
    date: string;
    time: string;
    serviceName: string;
    serviceType: 'salon' | 'home';
    address: string;
    price: number;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { to, subject, bookingType, bookingDetails } = await req.json() as EmailRequest;

    console.log(`Sending ${bookingType} confirmation email to: ${to}`);
    console.log("Booking details:", bookingDetails);

    // This is a placeholder for actual email sending logic
    // In a production environment, you would integrate with an email service like Resend, SendGrid, etc.
    
    // Simulate successful email sending
    const response = {
      success: true,
      message: `Email confirmation for ${bookingType} booking sent to ${to}`,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
