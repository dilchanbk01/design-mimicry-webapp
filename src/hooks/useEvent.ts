
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getOptimizedImageUrl } from "@/utils/imageCompression";
import type { Event } from "@/types/events";

export function useEvent(id: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingTickets, setRemainingTickets] = useState<number | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  // Setup real-time updates for ticket count
  useEffect(() => {
    if (!id) return;
    
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${id}`,
        },
        () => {
          fetchRemainingTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchRemainingTickets = async () => {
    try {
      if (!id) return;
      
      const { count, error: bookingsError } = await supabase
        .from("bookings")
        .select("*", { count: 'exact', head: true })
        .eq("event_id", id)
        .eq("status", "confirmed");

      if (bookingsError) throw bookingsError;

      if (event) {
        setRemainingTickets(event.capacity - (count || 0));
      }
    } catch (error) {
      console.error("Error fetching remaining tickets:", error);
    }
  };

  // Fetch event details
  useEffect(() => {
    async function fetchEventAndBookings() {
      if (!id) return;
      
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(`
            id,
            title,
            description,
            image_url,
            date,
            duration,
            location,
            price,
            capacity,
            event_type,
            organizer_name,
            organizer_email,
            organizer_phone,
            organizer_website,
            pet_types,
            pet_requirements
          `)
          .eq("id", id)
          .single();

        if (eventError) throw eventError;
        
        setEvent({
          ...eventData,
          image_url: getOptimizedImageUrl(eventData.image_url),
          duration: eventData.duration || 0,
          event_type: eventData.event_type || '',
        });
        
        const { count, error: bookingsError } = await supabase
          .from("bookings")
          .select("*", { count: 'exact', head: true })
          .eq("event_id", id)
          .eq("status", "confirmed");

        if (bookingsError) throw bookingsError;
        setRemainingTickets(eventData.capacity - (count || 0));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .eq("status", "confirmed")
            .single();

          setIsBooked(!!userBookings);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again later.",
          variant: "destructive",
        });
        navigate("/events");
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndBookings();
  }, [id, navigate, toast]);

  return {
    event,
    loading,
    remainingTickets,
    isBooked,
    fetchRemainingTickets
  };
}
