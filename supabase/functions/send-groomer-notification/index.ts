
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GroomerNotificationRequest {
  groomerEmail: string;
  groomerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  date: string;
  time: string;
  serviceName: string;
  serviceType: string;
  address: string;
  petDetails: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body
    const reqData: GroomerNotificationRequest = await req.json();

    const {
      groomerEmail,
      groomerName,
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      serviceName,
      serviceType,
      address,
      petDetails,
    } = reqData;

    if (!groomerEmail) {
      throw new Error("Groomer email is required");
    }

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailResponse = await resend.emails.send({
      from: "Petsu <notifications@petsu.lovable.dev>",
      to: [groomerEmail],
      subject: `New Booking: ${customerName} has booked an appointment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50; margin-bottom: 10px;">New Grooming Appointment!</h1>
            <p style="font-size: 16px; color: #374151;">Hi ${groomerName}, you've received a new booking</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; margin-top: 0;">Appointment Details</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            ${serviceType === 'Home Visit' ? 
              `<p><strong>Client Address:</strong> ${address}</p>` : 
              `<p><strong>Location:</strong> Your salon</p>`
            }
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; margin-top: 0;">Customer Information</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
            <p><strong>Pet Details:</strong> ${petDetails}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>This is an automated message from Petsu. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-groomer-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
