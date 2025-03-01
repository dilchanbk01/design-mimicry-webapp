import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { booking_id, user_email, booking_date, service_name, pet_name } = await req.json();

    if (!booking_id || !user_email || !booking_date || !service_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Format the date for display
    const formattedDate = new Date(booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format the time for display
    const formattedTime = new Date(booking_date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send the email
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        to: user_email,
        subject: "Your Petsu Booking Confirmation",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://gllffexjqromdcqgoeec.supabase.co/storage/v1/object/public/public/petsu-logo.png" alt="Petsu Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #4CAF50; text-align: center;">Booking Confirmation</h2>
            <p>Hello,</p>
            <p>Your booking has been confirmed! Here are the details:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Service:</strong> ${service_name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${pet_name ? `<p><strong>Pet:</strong> ${pet_name}</p>` : ''}
              <p><strong>Booking ID:</strong> ${booking_id}</p>
            </div>
            <p>If you need to make any changes to your booking, please contact us at <a href="mailto:care@petsu.in">care@petsu.in</a>.</p>
            <p>Thank you for choosing Petsu!</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
              <p>© 2023 Petsu. All rights reserved.</p>
              <p>690E JP nagar 2nd phase, 560078, Bangalore</p>
            </div>
          </div>
        `,
      },
    });

    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
