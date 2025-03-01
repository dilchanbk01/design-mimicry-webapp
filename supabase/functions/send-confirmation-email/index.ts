
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  bookingType: "event" | "grooming";
  bookingDetails: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, bookingType, bookingDetails }: EmailRequest = await req.json();
    
    console.log(`Received request to send ${bookingType} confirmation email to: ${to}`);
    console.log("Booking details:", JSON.stringify(bookingDetails));

    let htmlContent = "";
    
    if (bookingType === "event") {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #00D26A; text-align: center;">Event Booking Confirmation</h1>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">${bookingDetails.title}</h2>
            <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${bookingDetails.location}</p>
            <p><strong>Number of Tickets:</strong> ${bookingDetails.tickets}</p>
          </div>
          <p>Thank you for booking with us! We're excited to see you at the event.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #888; font-size: 12px;">© ${new Date().getFullYear()} Petsu. All rights reserved.</p>
          </div>
        </div>
      `;
    } else if (bookingType === "grooming") {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #00D26A; text-align: center;">Grooming Appointment Confirmation</h1>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Appointment with ${bookingDetails.groomerName}</h2>
            <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${bookingDetails.time}</p>
            <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
            <p><strong>Service Type:</strong> ${bookingDetails.serviceType === 'salon' ? 'Salon Visit' : 'Home Visit'}</p>
            ${bookingDetails.serviceType === 'home' ? `<p><strong>Address:</strong> ${bookingDetails.address}</p>` : ''}
            <p><strong>Total Price:</strong> ₹${bookingDetails.price}</p>
          </div>
          <p>Thank you for choosing our grooming services! We look forward to pampering your pet.</p>
          <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #888; font-size: 12px;">© ${new Date().getFullYear()} Petsu. All rights reserved.</p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Petsu Pet Services <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
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
    console.error("Error in send-confirmation-email function:", error);
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
