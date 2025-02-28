
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, eventId, userId } = await req.json();
    
    // Check if this is a payout request notification
    if (type === 'payout_request') {
      console.log(`Processing payout request notification for event: ${eventId}`);
      
      // Get event details
      const { data: event, error: eventError } = await supabaseClient
        .from('events')
        .select('title, organizer_name')
        .eq('id', eventId)
        .single();
      
      if (eventError) {
        console.error('Error fetching event:', eventError);
        return new Response(
          JSON.stringify({ error: 'Error fetching event details' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Get admin users to notify
      const { data: admins, error: adminsError } = await supabaseClient
        .from('admin_users')
        .select('email');
      
      if (adminsError) {
        console.error('Error fetching admins:', adminsError);
        return new Response(
          JSON.stringify({ error: 'Error fetching admin users' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Get payout request details
      const { data: payoutRequest, error: payoutError } = await supabaseClient
        .from('payout_requests')
        .select('*')
        .eq('event_id', eventId)
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (payoutError) {
        console.error('Error fetching payout request:', payoutError);
        return new Response(
          JSON.stringify({ error: 'Error fetching payout request' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Here you would typically send an email to admins
      // Using a third-party email service like Resend, SendGrid, etc.
      // For this example, we'll just log the notification
      
      console.log('Notifying admins about new payout request:');
      console.log(`Event: ${event.title}`);
      console.log(`Organizer: ${event.organizer_name}`);
      console.log(`Account Name: ${payoutRequest.account_name}`);
      console.log(`Account Number: ${payoutRequest.account_number}`);
      console.log(`IFSC Code: ${payoutRequest.ifsc_code}`);
      console.log(`Admin emails: ${admins.map(admin => admin.email).join(', ')}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin notification sent',
          notifiedAdmins: admins.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Default response for other notification types
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification processed',
        type 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
