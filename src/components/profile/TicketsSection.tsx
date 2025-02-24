
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Booking {
  id: string;
  event: {
    title: string;
    date: string;
    image_url: string;
  };
}

export function TicketsSection() {
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          event:events (
            title,
            date,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTickets(bookings || []);
      setLoading(false);
    };

    loadTickets();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        You haven't booked any tickets yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div 
          key={ticket.id}
          className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
        >
          <img 
            src={ticket.event.image_url} 
            alt={ticket.event.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-medium">{ticket.event.title}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(ticket.event.date), 'PPP')}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              new Date(ticket.event.date) < new Date() 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-primary/10 text-primary'
            }`}>
              {new Date(ticket.event.date) < new Date() ? 'Past' : 'Upcoming'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
