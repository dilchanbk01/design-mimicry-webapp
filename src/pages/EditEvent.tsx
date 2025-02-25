
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  image_url: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  organizer_website: string;
  pet_types: string;
  pet_requirements: string;
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to fetch event details",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event) return;

    try {
      const { error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      navigate('/admin');
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={event.title}
                onChange={e => setEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="datetime-local"
                value={new Date(event.date).toISOString().slice(0, 16)}
                onChange={e => setEvent(prev => prev ? { ...prev, date: e.target.value } : null)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={event.location}
                onChange={e => setEvent(prev => prev ? { ...prev, location: e.target.value } : null)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="number"
                value={event.price}
                onChange={e => setEvent(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <Input
                type="number"
                value={event.capacity}
                onChange={e => setEvent(prev => prev ? { ...prev, capacity: Number(e.target.value) } : null)}
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pet Types</label>
              <Input
                value={event.pet_types || ''}
                onChange={e => setEvent(prev => prev ? { ...prev, pet_types: e.target.value } : null)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={event.description}
              onChange={e => setEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pet Requirements</label>
            <Textarea
              value={event.pet_requirements || ''}
              onChange={e => setEvent(prev => prev ? { ...prev, pet_requirements: e.target.value } : null)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Organizer Name</label>
              <Input
                value={event.organizer_name || ''}
                onChange={e => setEvent(prev => prev ? { ...prev, organizer_name: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organizer Email</label>
              <Input
                type="email"
                value={event.organizer_email || ''}
                onChange={e => setEvent(prev => prev ? { ...prev, organizer_email: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organizer Phone</label>
              <Input
                value={event.organizer_phone || ''}
                onChange={e => setEvent(prev => prev ? { ...prev, organizer_phone: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organizer Website</label>
              <Input
                value={event.organizer_website || ''}
                onChange={e => setEvent(prev => prev ? { ...prev, organizer_website: e.target.value } : null)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
