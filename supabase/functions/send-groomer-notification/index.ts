
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingDetails {
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  serviceName: string;
  serviceType: 'salon' | 'home';
  address: string;
  petDetails: string;
  price: number;
}

interface RequestBody {
  to: string;
  subject: string;
  bookingDetails: BookingDetails;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { to, subject, bookingDetails }: RequestBody = await req.json();
    
    const { customerName, customerEmail, date, time, serviceName, serviceType, address, petDetails, price } = bookingDetails;

    // Basic validation
    if (!to || !subject || !bookingDetails) {
      throw new Error("Missing required fields");
    }

    console.log(`Sending groomer notification email to: ${to}`);

    // Use Resend to send the email
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Petsu Grooming <no-reply@resend.dev>",
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #4CAF50; text-align: center;">New Grooming Appointment</h1>
            <p style="font-size: 16px;">You have a new grooming appointment booking!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h2 style="color: #333; font-size: 18px; margin-top: 0;">Customer Information</h2>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h2 style="color: #333; font-size: 18px; margin-top: 0;">Appointment Details</h2>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Service Type:</strong> ${serviceType === 'home' ? 'Home Visit' : 'Salon Visit'}</p>
              <p><strong>Location:</strong> ${address}</p>
              <p><strong>Pet Details:</strong> ${petDetails}</p>
              <p><strong>Price:</strong> ₹${price}</p>
            </div>
            
            <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
              This is an automated notification from Petsu. Please do not reply to this email.
            </p>
          </div>
        `,
      }),
    });

    const resendData = await resendResponse.json();
    console.log("Resend API response:", resendData);

    if (!resendResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(resendData)}`);
    }

    return new Response(JSON.stringify(resendData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-groomer-notification function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while sending the notification email",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
