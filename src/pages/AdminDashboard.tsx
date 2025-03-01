
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { EventsList } from "@/components/admin/EventsList";
import { GroomersList } from "@/components/admin/GroomersList";
import { SearchBar } from "@/components/admin/SearchBar";
import { HeroBannerManagement } from "@/components/admin/HeroBannerManagement";
import { PayoutRequestsSection } from "@/components/admin/PayoutRequestsSection";
import { GroomerPayoutsSection } from "@/components/admin/GroomerPayoutsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, CircleDollarSign, Image } from "lucide-react";

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
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('event_analytics')
        .select('tickets_sold, total_amount');

      if (analyticsError) throw analyticsError;

      // Get total events and pending events count
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('status');

      if (eventsError) throw eventsError;

      if (analyticsData && eventsData) {
        setAnalytics({
          total_events: eventsData.length,
          pending_events: eventsData.filter(e => e.status === 'pending').length,
          total_tickets: analyticsData.reduce((sum, event) => sum + (event.tickets_sold || 0), 0),
          total_revenue: analyticsData.reduce((sum, event) => sum + (event.total_amount || 0), 0)
        });
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
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              placeholder="Search by name, email, location, account details..."
            />
          </div>

          <Tabs 
            defaultValue="events" 
            onValueChange={(value) => setActiveTab(value)}
            className="space-y-4"
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-4 md:flex">
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
              <TabsTrigger value="banners" className="flex items-center">
                <Image className="h-4 w-4 mr-2" />
                Banners
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <AdminAnalytics analytics={analytics} />
              <EventsList searchQuery={searchQuery} />
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
              <GroomersList searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="banners">
              <HeroBannerManagement searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
