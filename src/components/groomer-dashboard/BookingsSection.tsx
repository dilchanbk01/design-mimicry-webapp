
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Home, Store, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  date: string;
  time: string;
  user_id: string;
  pet_details: string;
  status: string;
  service_type: string;
  created_at: string;
  payment_id: string;
  package_id: string | null;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  package_name?: string;
  groomer_id: string;
  home_address?: string;
  additional_cost?: number;
}

export function BookingsSection({ groomerId }: { groomerId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();

    // Enable realtime for the grooming_bookings table
    const enableRealtimeForTable = async () => {
      try {
        // Check if replication is already enabled for table
        const { data: replicatedTables, error: replicatedError } = await supabase
          .from('pg_catalog.pg_publication_tables')
          .select('tablename')
          .eq('pubname', 'supabase_realtime');
        
        if (replicatedError) {
          console.error("Error checking replicated tables:", replicatedError);
        }
        
        // Log the tables currently enabled for realtime
        console.log("Tables with realtime enabled:", replicatedTables);
      } catch (error) {
        console.error("Error checking realtime status:", error);
      }
    };
    
    enableRealtimeForTable();

    // Set up realtime subscription for booking updates
    const channel = supabase
      .channel('grooming_bookings_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'grooming_bookings',
          filter: `groomer_id=eq.${groomerId}`
        }, 
        (payload) => {
          console.log("Booking changed, received event:", payload);
          fetchBookings();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groomerId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings for groomer:", groomerId);
      
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("*")
        .eq("groomer_id", groomerId)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }

      console.log("Fetched bookings data:", data);

      // Get user details for each booking
      const bookingsWithUserDetails = await Promise.all(
        (data || []).map(async (booking) => {
          try {
            console.log("Processing booking:", booking.id, "Service type:", booking.service_type);
            
            // Get profile data
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("full_name, phone_number")
              .eq("id", booking.user_id)
              .single();

            if (userError) {
              console.error("Error fetching user profile:", userError);
            }

            // Get user auth data
            const { data: authData, error: authError } = await supabase.auth.admin.getUserById(booking.user_id);
            
            if (authError) {
              console.error("Error fetching user auth data:", authError);
            }

            // Get package details if available
            let packageName = "Standard Grooming";
            
            if (booking.package_id) {
              const { data: packageData, error: packageError } = await supabase
                .from("grooming_packages")
                .select("name")
                .eq("id", booking.package_id)
                .single();
              
              if (packageError) {
                console.error("Error fetching package:", packageError);
              }
              
              if (packageData) {
                packageName = packageData.name;
              }
            }
            
            // Return booking with user details
            return {
              ...booking,
              user_name: userData?.full_name || "Unknown",
              user_email: authData?.user?.email || "Unknown",
              user_phone: userData?.phone_number || "Not provided",
              package_name: packageName,
              // Ensure required fields are present
              id: booking.id,
              date: booking.date,
              time: booking.time,
              user_id: booking.user_id,
              pet_details: booking.pet_details || "",
              status: booking.status || "pending",
              service_type: booking.service_type,
              created_at: booking.created_at,
              payment_id: booking.payment_id || "",
              package_id: booking.package_id || null,
              groomer_id: booking.groomer_id,
              home_address: booking.home_address || "",
              additional_cost: booking.additional_cost || 0
            } as Booking;
          } catch (err) {
            console.error("Error processing booking:", booking.id, err);
            // Return booking with default values
            return {
              ...booking,
              user_name: "Unknown",
              user_email: "Unknown",
              user_phone: "Not provided",
              package_name: "Standard Grooming",
              // Ensure required fields are present
              id: booking.id,
              date: booking.date,
              time: booking.time,
              user_id: booking.user_id,
              pet_details: booking.pet_details || "",
              status: booking.status || "pending",
              service_type: booking.service_type,
              created_at: booking.created_at,
              payment_id: booking.payment_id || "",
              package_id: booking.package_id || null,
              groomer_id: booking.groomer_id,
              home_address: booking.home_address || "",
              additional_cost: booking.additional_cost || 0
            } as Booking;
          }
        })
      );

      // Filter for only upcoming appointments (today or future dates)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const upcomingBookings = bookingsWithUserDetails.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today && booking.status !== 'cancelled';
      });
      
      console.log("Upcoming bookings:", upcomingBookings.length);
      
      // Sort by date and time
      upcomingBookings.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // If dates are the same, sort by time
        return a.time.localeCompare(b.time);
      });
      
      setBookings(upcomingBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    return serviceType === 'home' ? 
      <Home className="h-4 w-4 text-purple-500" /> : 
      <Store className="h-4 w-4 text-blue-500" />;
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#4CAF50]" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <div className="flex items-start gap-2">
                      <div className="bg-[#E5DEFF] text-[#7E69AB] p-2 rounded-lg">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {format(new Date(booking.date), 'dd MMM yyyy')}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </Badge>
                          <Badge variant="outline" className={booking.service_type === 'home' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                            <span className="flex items-center gap-1">
                              {getServiceTypeIcon(booking.service_type)}
                              {booking.service_type === 'home' ? 'Home Visit' : 'At Salon'}
                            </span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{booking.user_name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="flex items-center gap-1 mb-1">
                            <Mail className="h-3 w-3" />
                            {booking.user_email}
                          </p>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {booking.user_phone}
                          </p>
                          <p className="text-xs mt-1">Service: {booking.package_name}</p>
                          {booking.additional_cost > 0 && (
                            <p className="text-xs">Additional cost: ₹{booking.additional_cost}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                    <span className="font-medium">Pet details:</span> {booking.pet_details}
                  </div>
                  
                  {booking.service_type === 'home' && booking.home_address && (
                    <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                      <span className="font-medium flex items-center gap-1">
                        <Home className="h-3 w-3" /> Client Address:
                      </span> 
                      <p className="text-gray-700 mt-1">{booking.home_address}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
