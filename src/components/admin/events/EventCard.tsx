
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, MapPin, DollarSign } from "lucide-react";

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

interface EventCardProps {
  event: Event;
  onEdit: (id: string) => void;
  onDelete: (event: Event) => void;
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void;
}

export function EventCard({ event, onEdit, onDelete, onStatusChange }: EventCardProps) {
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

  return (
    <div className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
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
                  onClick={() => onEdit(event.id)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(event)}
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
              onClick={() => onStatusChange(event.id, 'rejected')}
              className="text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button 
              size="sm"
              onClick={() => onStatusChange(event.id, 'approved')}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
