
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
  user_email?: string;
  user_name?: string;
  package_name?: string;
}

export function BookingsSection({ groomerId }: { groomerId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [groomerId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("*")
        .eq("groomer_id", groomerId)
        .order("date", { ascending: false });

      if (error) throw error;

      // Get user details for each booking
      const bookingsWithUserDetails = await Promise.all(
        (data || []).map(async (booking) => {
          try {
            const { data: userData } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("id", booking.user_id)
              .single();

            const { data: userAuth } = await supabase.auth
              .admin.getUserById(booking.user_id);

            // Get package details if available
            let packageName = "Standard Grooming";
            if (booking.package_id) {
              const { data: packageData } = await supabase
                .from("grooming_packages")
                .select("name")
                .eq("id", booking.package_id)
                .single();
              
              if (packageData) {
                packageName = packageData.name;
              }
            }

            return {
              ...booking,
              user_name: userData?.full_name || "Unknown",
              user_email: userAuth?.user?.email || "Unknown",
              package_name: packageName
            };
          } catch (err) {
            console.error("Error fetching user details:", err);
            return {
              ...booking,
              user_name: "Unknown",
              user_email: "Unknown",
              package_name: "Standard Grooming"
            };
          }
        })
      );

      setBookings(bookingsWithUserDetails);
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
              <p>No bookings yet</p>
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
                            {new Date(booking.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {booking.status}
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
                          <p>{booking.user_email}</p>
                          <p className="text-xs">Service: {booking.package_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                    <span className="font-medium">Pet details:</span> {booking.pet_details}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
