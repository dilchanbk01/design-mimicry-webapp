
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  bookingType: "event" | "grooming";
  bookingDetails: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlContent, bookingType, bookingDetails } = await req.json() as EmailRequest;
    
    console.log(`Received request to send ${bookingType} confirmation email to: ${to}`);
    console.log("Booking details:", JSON.stringify(bookingDetails));

    // Create a Supabase client with the service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // For now, we'll simulate email sending and just log the data
    // In a real implementation, you would connect to an email service like Resend or SendGrid
    
    // Simple email template based on booking type
    let emailBody = "";
    
    if (bookingType === "event") {
      emailBody = `
        <h1>Event Booking Confirmation</h1>
        <p>Thank you for booking the event "${bookingDetails.title}"!</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${bookingDetails.location}</p>
        <p><strong>Number of Tickets:</strong> ${bookingDetails.tickets}</p>
        <p>We look forward to seeing you there!</p>
      `;
    } else if (bookingType === "grooming") {
      emailBody = `
        <h1>Grooming Appointment Confirmation</h1>
        <p>Your appointment with ${bookingDetails.groomerName} has been confirmed.</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
        <p>Your pet will look great!</p>
      `;
    }

    console.log("Email would be sent with the following content:");
    console.log(emailBody);

    // Record this email in a logs table if you have one
    // const { error: logError } = await supabaseAdmin
    //   .from("email_logs")
    //   .insert({
    //     recipient: to,
    //     subject: subject,
    //     booking_type: bookingType,
    //     sent_at: new Date(),
    //     status: "sent"
    //   });

    return new Response(
      JSON.stringify({ success: true, message: "Email would be sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
