
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { EventCard } from "@/components/events/EventCard";

interface Event {
  id: string;
  title: string;
  date: string;
  image_url: string;
  location: string;
  price: number;
}

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
        setEvents(eventsData);
        
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
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
        <Button onClick={() => navigate('/create-event')}>
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
