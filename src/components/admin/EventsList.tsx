
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Edit, Trash2, CalendarDays, User, DollarSign, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/edit-event/${eventId}`);
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
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="active">Active Events</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                {searchQuery 
                  ? "No events matching your search" 
                  : `No ${activeFilter === 'all' ? '' : activeFilter} events found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(event.status)}
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditEvent(event.id)}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                        <p className="text-sm flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-400" /> 
                          Organizer: {event.organizer_name || 'Not specified'}
                        </p>
                        <p className="text-sm flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" /> 
                          Location: {event.location}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500 mr-1">Date:</span> 
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500 mr-1">Email:</span> 
                          {event.organizer_email || 'Not specified'}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500 mr-1">Phone:</span> 
                          {event.organizer_phone || 'Not provided'}
                        </p>
                        <p className="text-sm flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" /> 
                          Price: ₹{event.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <span>Created: {format(new Date(event.created_at), 'PPP')}</span>
                        <span className="mx-2">•</span>
                        <span>Capacity: {event.capacity} attendees</span>
                        <span className="mx-2">•</span>
                        <span>Duration: {event.duration} mins</span>
                      </div>
                    </div>
                    
                    {event.status === 'pending' && (
                      <div className="mt-3 lg:mt-0 flex lg:flex-col gap-2 self-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(event.id, 'rejected')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(event.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteEvent();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
