
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventsTable } from "@/components/admin/EventsTable";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { PayoutRequestsSection } from "@/components/admin/PayoutRequestsSection";
import { GroomerPayoutsSection } from "@/components/admin/GroomerPayoutsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, CircleDollarSign, Search, CalendarDays, Users } from "lucide-react";

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
  contact_number: string;
  address: string;
  bio: string | null;
  email?: string;
  user_id?: string;
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
  const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
  const [filteredGroomers, setFilteredGroomers] = useState<GroomerProfile[]>([]);
  const [activeTab, setActiveTab] = useState("events");
  const [activePayoutTab, setActivePayoutTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdminStatus();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "groomers") {
      fetchGroomers();
    }
  }, [activeTab]);

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
    } else if (activeTab === "groomers") {
      setFilteredGroomers(
        groomers.filter(groomer => 
          groomer.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.contact_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, events, groomers, activeTab]);

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
        // Get user emails for groomers
        const userIds = data.map(groomer => groomer.user_id);
        
        // Fetch user data first
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (userError) {
          console.error("Error fetching user data:", userError);
        }
        
        // Process the data to ensure we have all fields needed
        const processedData = data.map(groomer => {
          const userInfo = userData ? userData.find(u => u.id === groomer.user_id) : null;
          
          return {
            id: groomer.id,
            user_id: groomer.user_id,
            salon_name: groomer.salon_name || "Unnamed Salon",
            experience_years: groomer.experience_years || 0,
            application_status: groomer.application_status || "pending",
            created_at: groomer.created_at || new Date().toISOString(),
            admin_notes: groomer.admin_notes,
            contact_number: groomer.contact_number || "Not provided",
            address: groomer.address || "Not provided",
            bio: groomer.bio,
            email: userInfo?.full_name || "Unknown user"
          };
        });
        
        console.log("Processed groomer data:", processedData);
        setGroomers(processedData);
        setFilteredGroomers(processedData);
        
        // Log specific details about pending applications
        const pendingApplications = data.filter(g => g.application_status === 'pending');
        console.log(`Found ${pendingApplications.length} pending applications:`, pendingApplications);
      } else {
        console.log("No groomer data found or empty array returned");
        setGroomers([]);
        setFilteredGroomers([]);
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

          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, email, location..."
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
          >
            <TabsList className="mb-4">
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

            <TabsContent value="events">
              <AnalyticsOverview analytics={analytics} />
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
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Groomer Applications</h2>
                <Button onClick={handleRefreshGroomers} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-4">
                {filteredGroomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 
                      "No groomer applications found matching your search criteria." : 
                      "No groomer applications found. Try refreshing or check the database."}
                  </div>
                ) : (
                  filteredGroomers.map((groomer) => (
                    <Card key={groomer.id} className="p-4">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <h3 className="font-semibold text-lg">{groomer.salon_name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                              <p className="text-sm">
                                <span className="text-gray-500">Experience:</span> {groomer.experience_years} years
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Contact:</span> {groomer.contact_number}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Email/User:</span> {groomer.email}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Location:</span> {groomer.address}
                              </p>
                              <p className="text-sm col-span-2">
                                <span className="text-gray-500">Status:</span> <span className={`font-medium ${
                                  groomer.application_status === 'approved' ? 'text-green-600' :
                                  groomer.application_status === 'rejected' ? 'text-red-600' :
                                  'text-yellow-600'
                                }`}>
                                  {groomer.application_status}
                                </span>
                              </p>
                              {groomer.bio && (
                                <p className="text-sm col-span-2">
                                  <span className="text-gray-500">Bio:</span> {groomer.bio}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 col-span-2">
                                Created: {new Date(groomer.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400 col-span-2">
                                ID: {groomer.id}
                              </p>
                              {groomer.admin_notes && (
                                <p className="text-sm col-span-2 mt-2 p-2 bg-yellow-50 rounded-md">
                                  <span className="font-medium text-yellow-800">Admin Notes:</span> {groomer.admin_notes}
                                </p>
                              )}
                            </div>
                          </div>
                          {groomer.application_status === 'pending' && (
                            <div className="flex gap-2 md:flex-col md:items-end">
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
                      </CardContent>
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
