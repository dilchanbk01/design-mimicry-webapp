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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { groomerId, message, title } = await req.json();

    if (!groomerId) {
      return new Response(
        JSON.stringify({ error: "Groomer ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get groomer details
    const { data: groomer, error: groomerError } = await supabase
      .from("groomer_profiles")
      .select("user_id, salon_name")
      .eq("id", groomerId)
      .single();

    if (groomerError) {
      return new Response(
        JSON.stringify({ error: "Groomer not found", details: groomerError }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user email
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", groomer.user_id)
      .single();

    if (userError) {
      return new Response(
        JSON.stringify({ error: "User not found", details: userError }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send email notification
    const { error: emailError } = await supabase.functions.invoke(
      "send-email",
      {
        body: {
          to: user.email,
          from: "care@petsu.in",
          subject: title || "New Notification from Petsu",
          text: message || "You have a new notification from Petsu.",
          html: `<p>${message || "You have a new notification from Petsu."}</p>`,
        },
      }
    );

    if (emailError) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from("groomer_notifications")
      .insert({
        groomer_id: groomerId,
        title: title || "New Notification",
        message: message || "You have a new notification from Petsu.",
        read: false,
      })
      .select()
      .single();

    if (notificationError) {
      return new Response(
        JSON.stringify({
          error: "Failed to create notification record",
          details: notificationError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
        data: notification,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
