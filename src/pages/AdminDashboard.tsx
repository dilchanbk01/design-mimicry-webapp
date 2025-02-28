
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventsTable } from "@/components/admin/EventsTable";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { PayoutRequestsSection } from "@/components/admin/PayoutRequestsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

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

interface GroomerProfile {
  id: string;
  salon_name: string;
  experience_years: number;
  application_status: string;
  created_at: string;
  admin_notes: string | null;
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
  const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    checkAdminStatus();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "groomers") {
      fetchGroomers();
    }
  }, [activeTab]);

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

  const fetchGroomers = async () => {
    try {
      console.log("Fetching groomer applications...");
      
      // Drop any filters to see all groomer profiles
      const { data, error } = await supabase
        .from("groomer_profiles")
        .select("*");
      
      if (error) {
        console.error("Error fetching groomers:", error);
        throw error;
      }
      
      console.log("Raw groomer data:", data);
      
      if (data && data.length > 0) {
        // Process the data to ensure we have all fields needed
        const processedData = data.map(groomer => ({
          id: groomer.id,
          salon_name: groomer.salon_name || "Unnamed Salon",
          experience_years: groomer.experience_years || 0,
          application_status: groomer.application_status || "pending",
          created_at: groomer.created_at || new Date().toISOString(),
          admin_notes: groomer.admin_notes
        }));
        
        console.log("Processed groomer data:", processedData);
        setGroomers(processedData);
        
        // Log specific details about pending applications
        const pendingApplications = data.filter(g => g.application_status === 'pending');
        console.log(`Found ${pendingApplications.length} pending applications:`, pendingApplications);
      } else {
        console.log("No groomer data found or empty array returned");
        setGroomers([]);
      }
    } catch (error) {
      console.error("Error fetching groomers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch groomer applications",
        variant: "destructive",
      });
    }
  };

  const handleGroomerStatus = async (groomerId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Updating groomer ${groomerId} to status: ${status}`);
      
      const { error } = await supabase
        .from("groomer_profiles")
        .update({ application_status: status })
        .eq("id", groomerId);

      if (error) {
        console.error("Error updating groomer status:", error);
        throw error;
      }

      console.log("Groomer status updated successfully");
      toast({
        title: "Success",
        description: `Groomer application ${status}`,
      });

      // Refetch the groomers to update the UI
      fetchGroomers();
    } catch (error) {
      console.error("Error updating groomer status:", error);
      toast({
        title: "Error",
        description: "Failed to update groomer status",
        variant: "destructive",
      });
    }
  };

  // For debugging - force fetch groomers
  const handleRefreshGroomers = () => {
    console.log("Manual refresh of groomers requested");
    fetchGroomers();
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

          <Tabs 
            defaultValue="events" 
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="groomers">Groomers</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <AnalyticsOverview analytics={analytics} />
              <EventsTable 
                events={events} 
                onEventDeleted={fetchDashboardData}
                onStatusChange={handleEventStatus}
              />
            </TabsContent>

            <TabsContent value="payouts">
              <PayoutRequestsSection />
            </TabsContent>

            <TabsContent value="groomers">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Groomer Applications</h2>
                <Button onClick={handleRefreshGroomers} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-4">
                {groomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No groomer applications found. Try refreshing or check the database.
                  </div>
                ) : (
                  groomers.map((groomer) => (
                    <Card key={groomer.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{groomer.salon_name}</h3>
                          <p className="text-sm text-gray-500">
                            Experience: {groomer.experience_years} years
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: <span className={`font-medium ${
                              groomer.application_status === 'approved' ? 'text-green-600' :
                              groomer.application_status === 'rejected' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {groomer.application_status}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {groomer.id}
                          </p>
                        </div>
                        {groomer.application_status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleGroomerStatus(groomer.id, 'approved')}
                              className="bg-[#4CAF50] hover:bg-[#3e8e41]"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleGroomerStatus(groomer.id, 'rejected')}
                              variant="destructive"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
