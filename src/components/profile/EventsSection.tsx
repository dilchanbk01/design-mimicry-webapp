
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { EventCard } from "@/components/events/EventCard";
import { Event } from "@/types/events";

interface EventAnalytics {
  tickets_sold: number;
  total_amount: number;
}

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, EventAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('date', { ascending: true });

      if (eventsData) {
        // Cast the data to match the expected Event type
        const typedEvents = eventsData.map(event => {
          return {
            ...event,
            // Ensure all required fields exist with defaults if missing
            description: event.description || "",
            duration: event.duration || 0,
            capacity: event.capacity || 0,
            event_type: event.event_type || "",
            organizer_name: event.organizer_name || "",
            organizer_email: event.organizer_email || "",
            organizer_phone: event.organizer_phone || "",
            organizer_website: event.organizer_website || "",
            pet_types: event.pet_types || "",
            pet_requirements: event.pet_requirements || ""
          } as Event;
        });
        
        setEvents(typedEvents);
        
        // Fetch analytics for each event
        const analyticsData: Record<string, EventAnalytics> = {};
        for (const event of eventsData) {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('event_id', event.id)
            .eq('status', 'confirmed');
          
          analyticsData[event.id] = {
            tickets_sold: bookings?.length || 0,
            total_amount: (bookings?.length || 0) * event.price
          };
        }
        setAnalytics(analyticsData);
      }
      
      setLoading(false);
    };

    loadEvents();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-white">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white mb-4">You haven't created any events yet.</p>
        <Button onClick={() => navigate('/create-event')} className="bg-white text-green-600 hover:bg-white/90">
          Create Your First Event
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isBooked={false}
          isOrganizer={true}
          analytics={{
            ticketsSold: analytics[event.id]?.tickets_sold || 0,
            totalAmount: analytics[event.id]?.total_amount || 0
          }}
        />
      ))}
    </div>
  );
}
