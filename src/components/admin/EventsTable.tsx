
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  organizer_name: string;
}

interface EventsTableProps {
  events: Event[];
  onEventDeleted: () => void;
  onStatusChange: (eventId: string, status: 'approved' | 'rejected') => void;
}

export function EventsTable({ events, onEventDeleted, onStatusChange }: EventsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (eventId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
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

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Events Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">by {event.organizer_name}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {format(new Date(event.date), 'PPp')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {event.location}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  event.status === 'approved' ? 'bg-green-100 text-green-800' :
                  event.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium space-x-2">
                {event.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => onStatusChange(event.id, 'approved')}
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => onStatusChange(event.id, 'rejected')}
                      variant="outline"
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
