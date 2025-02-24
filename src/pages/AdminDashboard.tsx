
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

export default function AdminDashboard() {
  const navigate = useNavigate();
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
      // Fetch events
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

      // Fetch hero banners
      const { data: bannersData } = await supabase
        .from('hero_banners')
        .select('*');

      if (bannersData) {
        setBanners(bannersData);
      }

      // Fetch analytics
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

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const handleUpdateBanner = async (bannerId: string) => {
    console.log('Update banner:', bannerId);
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
                        <h3 className="font-semibold">{banner.title}</h3>
                        <p className="text-sm text-gray-500">{banner.description}</p>
                      </div>
                      <Button
                        onClick={() => handleUpdateBanner(banner.id)}
                        variant="outline"
                        size="sm"
                      >
                        Update
                      </Button>
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
            <h2 className="text-2xl font-semibold mb-4">Events Requiring Approval</h2>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Event Analytics */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Event Performance</h2>
            <div className="grid grid-cols-1 gap-4">
              {eventAnalytics.map((event) => (
                <div key={event.event_id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.status === 'approved' ? 'bg-green-100 text-green-800' :
                      event.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Tickets Sold</p>
                      <p className="text-lg font-semibold">{event.tickets_sold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-lg font-semibold">${event.total_amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
