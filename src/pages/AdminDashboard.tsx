import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { EventsList } from "@/components/admin/EventsList";
import { GroomersList } from "@/components/admin/GroomersList";
import { SearchBar } from "@/components/admin/SearchBar";
import { PayoutRequestsSection } from "@/components/admin/PayoutRequestsSection";
import { GroomerPayoutsSection } from "@/components/admin/GroomerPayoutsSection";
import { AdminDashboardTabs } from "@/components/admin/AdminDashboardTabs";
import { PayoutsTabs } from "@/components/admin/PayoutsTabs";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

interface Analytics {
  total_events: number;
  pending_events: number;
  total_tickets: number;
  total_revenue: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('event_analytics')
        .select('tickets_sold, total_amount');

      if (analyticsError) throw analyticsError;

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
    }
  };

  const renderEventsContent = () => (
    <>
      <AdminAnalytics analytics={analytics} />
      <EventsList searchQuery={searchQuery} />
    </>
  );

  const renderPayoutsContent = () => (
    <PayoutsTabs
      activeTab={activePayoutTab}
      setActiveTab={setActivePayoutTab}
      eventsPayoutsContent={<PayoutRequestsSection searchQuery={searchQuery} />}
      groomersPayoutsContent={<GroomerPayoutsSection searchQuery={searchQuery} />}
    />
  );

  return (
    <AdminAuthGuard>
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

            <AdminDashboardTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              eventsContent={renderEventsContent()}
              payoutsContent={renderPayoutsContent()}
              groomersContent={<GroomersList searchQuery={searchQuery} />}
            />
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
