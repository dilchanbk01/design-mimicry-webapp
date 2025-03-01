
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { EventCard } from "./events/EventCard";
import { EventDeleteDialog } from "./events/EventDeleteDialog";
import { EventFilters } from "./events/EventFilters";

interface Event {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  capacity: number;
  created_at: string;
  description: string;
  duration: number;
  event_type: string;
  image_url: string;
  organizer_id: string;
  price: number;
}

interface EventsListProps {
  searchQuery: string;
}

export function EventsList({ searchQuery }: EventsListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      filterEvents(searchQuery);
    } else {
      applyStatusFilter(activeFilter);
    }
  }, [searchQuery, events, activeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const typedEvents = data.map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        }));
        setEvents(typedEvents);
        applyStatusFilter(activeFilter);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (query: string) => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.organizer_name?.toLowerCase().includes(query.toLowerCase()) ||
      event.organizer_email?.toLowerCase().includes(query.toLowerCase()) ||
      event.location?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const applyStatusFilter = (filter: string) => {
    let filtered;
    if (filter === "all") {
      filtered = events;
    } else if (filter === "active") {
      filtered = events.filter(e => e.status === 'approved' && new Date(e.date) >= new Date());
    } else {
      filtered = events.filter(e => e.status === filter);
    }

    // Apply search filter if there's a query
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredEvents(filtered);
  };

  const handleStatusChange = async (eventId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      ));
      
      setFilteredEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      ));
      
      toast({
        title: "Success",
        description: `Event ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setFilteredEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      setShowDeleteDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/edit-event/${eventId}`);
  };

  const renderEventsList = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      );
    }
    
    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-8">
          <CalendarDays className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">
            {searchQuery 
              ? "No events matching your search" 
              : `No ${activeFilter === 'all' ? '' : activeFilter} events found`}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={handleEditEvent}
            onDelete={(event) => {
              setSelectedEvent(event);
              setShowDeleteDialog(true);
            }}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
          Events Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveFilter}>
          <EventFilters activeFilter={activeFilter} />
          <TabsContent value={activeFilter}>
            {renderEventsList()}
          </TabsContent>
        </Tabs>
      </CardContent>

      <EventDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedEvent={selectedEvent}
        onDelete={handleDeleteEvent}
      />
    </Card>
  );
}
