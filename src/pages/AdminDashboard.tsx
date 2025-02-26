import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventsTable } from "@/components/admin/EventsTable";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";

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
}

interface Analytics {
  total_events: number;
  pending_events: number;
  total_tickets: number;
  total_revenue: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_events: 0,
    pending_events: 0,
    total_tickets: 0,
    total_revenue: 0
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
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      if (eventsData) {
        const typedEvents = eventsData.map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        }));
        setEvents(typedEvents);
        setAnalytics(prev => ({
          ...prev,
          total_events: eventsData.length,
          pending_events: eventsData.filter(e => e.status === 'pending').length
        }));
      }

      const { data: analyticsData, error: analyticsError } = await supabase
        .from('event_analytics')
        .select('tickets_sold, total_amount');

      if (analyticsError) throw analyticsError;

      if (analyticsData) {
        setAnalytics(prev => ({
          ...prev,
          total_tickets: analyticsData.reduce((sum, event) => sum + (event.tickets_sold || 0), 0),
          total_revenue: analyticsData.reduce((sum, event) => sum + (event.total_amount || 0), 0)
        }));
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

      setEvents(prev => prev.map(event => 
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

          <AnalyticsOverview analytics={analytics} />
          <EventsTable 
            events={events} 
            onEventDeleted={fetchDashboardData}
            onStatusChange={handleEventStatus}
          />
        </div>
      </div>
    </div>
  );
}
