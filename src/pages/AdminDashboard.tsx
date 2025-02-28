
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventsTable } from "@/components/admin/EventsTable";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { PayoutRequestsSection } from "@/components/admin/PayoutRequestsSection";
import { GroomerPayoutsSection } from "@/components/admin/GroomerPayoutsSection";
import { GroomerManagement } from "@/components/admin/GroomerManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CalendarDays, Users, CircleDollarSign } from "lucide-react";

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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_events: 0,
    pending_events: 0,
    total_tickets: 0,
    total_revenue: 0
  });
  const [activeTab, setActiveTab] = useState("events");
  const [activePayoutTab, setActivePayoutTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdminStatus();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Apply search filter when search query changes
    if (activeTab === "events") {
      setFilteredEvents(
        events.filter(event => 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, events, activeTab]);

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
        setFilteredEvents(typedEvents);
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

  // For debugging - force fetch data
  const handleRefreshData = () => {
    console.log("Manual refresh of data requested");
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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

          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, email, location, account details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Tabs 
            defaultValue="events" 
            onValueChange={(value) => setActiveTab(value)}
            className="space-y-4"
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-3 md:flex">
              <TabsTrigger value="events" className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="payouts" className="flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Payouts
              </TabsTrigger>
              <TabsTrigger value="groomers" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Groomers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <AdminAnalytics analytics={analytics} />
              <EventsTable 
                events={filteredEvents} 
                onEventDeleted={fetchDashboardData}
                onStatusChange={handleEventStatus}
              />
            </TabsContent>

            <TabsContent value="payouts">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CircleDollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  Payout Management
                </h2>
                <p className="text-gray-600 mb-4">
                  Manage payout requests from event organizers and grooming service providers.
                </p>
                
                <Tabs 
                  defaultValue="events" 
                  onValueChange={(value) => setActivePayoutTab(value)}
                  className="mt-4"
                >
                  <TabsList>
                    <TabsTrigger value="events">Event Payouts</TabsTrigger>
                    <TabsTrigger value="groomers">Groomer Payouts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="events">
                    <PayoutRequestsSection searchQuery={searchQuery} />
                  </TabsContent>
                  
                  <TabsContent value="groomers">
                    <GroomerPayoutsSection searchQuery={searchQuery} />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="groomers">
              <GroomerManagement 
                searchQuery={searchQuery}
                onRefresh={handleRefreshData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
