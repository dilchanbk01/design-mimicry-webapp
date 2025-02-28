
import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Trash2, MoreHorizontal, Calendar, MapPin, Users, Clock, CreditCard, User, CircleDollarSign, Mail, Phone, Link, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Event {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  organizer_name: string;
  capacity: number;
  created_at: string;
  description: string;
  duration: number;
  event_type: string;
  image_url: string;
  organizer_email: string;
  organizer_id: string;
  price: number;
  organizer_phone?: string;
  organizer_website?: string;
  pet_requirements?: string;
  pet_types?: string;
}

interface PayoutInfo {
  id: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  status: string;
  amount: number | null;
  created_at: string;
  processed_at: string | null;
}

interface EventsTableProps {
  events: Event[];
  onStatusChange: (eventId: string, status: 'approved' | 'rejected') => void;
  onEventDeleted: () => void;
}

export function EventsTable({ events, onStatusChange, onEventDeleted }: EventsTableProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [payoutInfo, setPayoutInfo] = useState<Record<string, PayoutInfo | null>>({});

  const toggleExpand = async (eventId: string) => {
    const isExpanded = expandedEvents.includes(eventId);
    
    if (isExpanded) {
      setExpandedEvents(expandedEvents.filter(id => id !== eventId));
    } else {
      setExpandedEvents([...expandedEvents, eventId]);
      
      // Fetch payout info if expanding
      if (!payoutInfo[eventId]) {
        await fetchPayoutInfo(eventId);
      }
    }
  };

  const fetchPayoutInfo = async (eventId: string) => {
    setLoading(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching payout info:", error);
        throw error;
      }

      setPayoutInfo(prev => ({ ...prev, [eventId]: data }));
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Could not load payout information",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [eventId]: false }));
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

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      onEventDeleted();
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
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <Calendar className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
        <p className="text-gray-500">There are no events matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden">
          <Collapsible 
            open={expandedEvents.includes(event.id)}
            onOpenChange={() => toggleExpand(event.id)}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(event.id)}>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <h3 className="font-medium text-lg mr-3">{event.title}</h3>
                  {getStatusBadge(event.status)}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {format(new Date(event.date), 'PPP')}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {event.capacity} attendees
                  </div>
                  <div className="flex items-center">
                    <CircleDollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    ₹{event.price}
                  </div>
                </div>
              </div>
              
              <div className="flex mt-3 md:mt-0">
                <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="mr-2">
                    {expandedEvents.includes(event.id) ? 'Less Details' : 'More Details'}
                  </Button>
                </CollapsibleTrigger>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {event.status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => onStatusChange(event.id, 'approved')}>
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          <span>Approve</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(event.id, 'rejected')}>
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          <span>Reject</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CollapsibleContent>
              <CardContent className="pb-4 border-t pt-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <User className="h-4 w-4 mr-1 text-blue-600" />
                      Organizer Information
                    </h4>
                    <div className="space-y-1.5 text-sm bg-white p-3 rounded-md border">
                      <p>
                        <span className="font-medium">Name:</span> {event.organizer_name || 'Not provided'}
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span className="font-medium mr-1">Email:</span> {event.organizer_email || 'Not provided'}
                      </p>
                      {event.organizer_phone && (
                        <p className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span className="font-medium mr-1">Phone:</span> {event.organizer_phone}
                        </p>
                      )}
                      {event.organizer_website && (
                        <p className="flex items-center">
                          <Link className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span className="font-medium mr-1">Website:</span> 
                          <a href={event.organizer_website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {event.organizer_website}
                          </a>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Organizer ID: {event.organizer_id || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-1 text-green-600" />
                      Payment & Payout Information
                    </h4>
                    <div className="bg-white p-3 rounded-md border space-y-1.5 text-sm">
                      {loading[event.id] ? (
                        <div className="py-2 flex items-center justify-center">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                        </div>
                      ) : payoutInfo[event.id] ? (
                        <>
                          <div className="mb-2">
                            <Badge className={`
                              ${payoutInfo[event.id]?.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                payoutInfo[event.id]?.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'} 
                              mr-2
                            `}>
                              {payoutInfo[event.id]?.status || 'pending'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Requested on {format(new Date(payoutInfo[event.id]?.created_at || ''), 'PPP')}
                            </span>
                          </div>
                          <p>
                            <span className="font-medium">Account Name:</span> {payoutInfo[event.id]?.account_name}
                          </p>
                          <p>
                            <span className="font-medium">Account Number:</span> {payoutInfo[event.id]?.account_number}
                          </p>
                          <p>
                            <span className="font-medium">IFSC Code:</span> {payoutInfo[event.id]?.ifsc_code}
                          </p>
                          <p>
                            <span className="font-medium">Amount:</span> ₹{payoutInfo[event.id]?.amount?.toFixed(2) || 'Not specified'}
                          </p>
                          {payoutInfo[event.id]?.processed_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Processed on {format(new Date(payoutInfo[event.id]?.processed_at), 'PPP')}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-2 text-gray-500">
                          No payout request made yet
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-purple-600" />
                      Event Details
                    </h4>
                    <div className="bg-white p-3 rounded-md border space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="mt-1">{event.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        <p>
                          <span className="font-medium">Type:</span> {event.event_type || 'General'}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span className="font-medium mr-1">Duration:</span> {event.duration} minutes
                        </p>
                        {event.pet_types && (
                          <p>
                            <span className="font-medium">Pet Types:</span> {event.pet_types}
                          </p>
                        )}
                        {event.pet_requirements && (
                          <p>
                            <span className="font-medium">Requirements:</span> {event.pet_requirements}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2 pt-2 border-t">
                        <span>Created:</span> {format(new Date(event.created_at), 'PPP pp')}
                        <span className="mx-2">•</span>
                        <span>Event ID:</span> {event.id}
                      </div>
                    </div>
                  </div>
                </div>
                
                {event.status === 'pending' && (
                  <div className="flex justify-end mt-4 gap-3">
                    <Button 
                      variant="destructive" 
                      onClick={() => onStatusChange(event.id, 'rejected')}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onStatusChange(event.id, 'approved')}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
