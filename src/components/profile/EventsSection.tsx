
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  date: string;
  image_url: string;
}

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('events')
        .select('id, title, date, image_url')
        .eq('organizer_id', user.id)
        .order('date', { ascending: true });

      setEvents(data || []);
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
        <div 
          key={event.id}
          className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
        >
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-medium">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(event.date), 'PPP')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
