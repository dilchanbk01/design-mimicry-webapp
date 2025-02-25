import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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
import { Edit, Trash2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  organizer_name: string;
}

interface Analytics {
  total_events: number;
  pending_events: number;
  total_tickets: number;
  total_revenue: number;
}

interface EventAnalytics {
  event_id: string;
  title: string;
  tickets_sold: number;
  total_amount: number;
  status: string;
}

interface HeroBanner {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  active: boolean | null;
  page: string;
}

interface BannerUploadForm {
  title: string;
  description: string;
  page: 'events' | 'home' | 'vets' | 'groomers';
  file: File | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_events: 0,
    pending_events: 0,
    total_tickets: 0,
    total_revenue: 0
  });
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<BannerUploadForm>({
    title: '',
    description: '',
    page: 'events',
    file: null
  });

  useEffect(() => {
    checkAdminStatus();
    fetchDashboardData();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/admin/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      navigate("/");
      return;
    }

    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsData) {
        setEvents(eventsData.map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        })));
      }

      const { data: bannersData } = await supabase
        .from('hero_banners')
        .select('*');

      if (bannersData) {
        setBanners(bannersData);
      }

      const { data: analyticsData } = await supabase
        .from('event_analytics')
        .select('*');

      if (analyticsData) {
        setEventAnalytics(analyticsData);
        
        const summary = {
          total_events: eventsData?.length || 0,
          pending_events: eventsData?.filter(e => e.status === 'pending').length || 0,
          total_tickets: analyticsData.reduce((sum, event) => sum + (event.tickets_sold || 0), 0),
          total_revenue: analyticsData.reduce((sum, event) => sum + (event.total_amount || 0), 0)
        };
        setAnalytics(summary);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventStatus = async (eventId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      fetchDashboardData();
      
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

  const handleBannerUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = formData.file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('banners')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('hero_banners')
        .insert({
          title: formData.title,
          description: formData.description,
          image_url: publicUrl,
          page: formData.page,
          active: true
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Banner uploaded successfully",
      });

      setFormData({
        title: '',
        description: '',
        page: 'events',
        file: null
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBannerToggle = async (bannerId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ active })
        .eq('id', bannerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banner ${active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (eventId: string) => {
    navigate(`/events/${eventId}/edit`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/admin/auth");
              }}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>

          {/* Hero Banner Management */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Hero Banner Management</h2>
            
            <form onSubmit={handleBannerUpload} className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Page</label>
                  <select
                    value={formData.page}
                    onChange={e => setFormData(prev => ({ ...prev, page: e.target.value as BannerUploadForm['page'] }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="events">Events</option>
                    <option value="home">Home</option>
                    <option value="vets">Vets</option>
                    <option value="groomers">Groomers</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Banner description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={uploading}
                className="mt-4"
              >
                {uploading ? 'Uploading...' : 'Upload Banner'}
              </Button>
            </form>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-4">
                      <img
                        src={banner.image_url}
                        alt={banner.title || 'Banner'}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{banner.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-500">{banner.description || 'No description'}</p>
                        <p className="text-sm text-gray-500">Page: {banner.page}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleBannerToggle(banner.id, !banner.active)}
                          variant={banner.active ? "destructive" : "default"}
                          size="sm"
                        >
                          {banner.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Events</h3>
              <p className="text-3xl font-bold text-blue-900">{analytics.total_events}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800">Pending Approvals</h3>
              <p className="text-3xl font-bold text-yellow-900">{analytics.pending_events}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Tickets Sold</h3>
              <p className="text-3xl font-bold text-green-900">{analytics.total_tickets}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Total Revenue</h3>
              <p className="text-3xl font-bold text-purple-900">${analytics.total_revenue}</p>
            </div>
          </div>

          {/* Events Table */}
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
                            onClick={() => handleEventStatus(event.id, 'approved')}
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleEventStatus(event.id, 'rejected')}
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleEdit(event.id)}
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
        </div>
      </div>
    </div>
  );
}
