
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar, 
  Clock, 
  User, 
  Home, 
  Store, 
  Phone, 
  Mail, 
  Search,
  Filter,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();

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
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groomerId]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterStatus, filterServiceType]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("*, profiles(full_name, phone_number)")
        .eq("groomer_id", groomerId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;

      const formattedBookings: Booking[] = data.map(booking => ({
        ...booking,
        user_name: booking.profiles?.full_name || "Unknown",
        user_phone: booking.profiles?.phone_number || "Not provided",
      }));
      
      setBookings(formattedBookings);
      setFilteredBookings(formattedBookings);
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

  const handleCancelBooking = async (booking: Booking) => {
    try {
      const { error } = await supabase
        .from('grooming_bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "The appointment has been cancelled successfully.",
      });

      // Close the dialog
      setShowCancelDialog(false);
      setSelectedBooking(null);

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by search term (name, email, pet details)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.user_name?.toLowerCase().includes(term)) || 
        (booking.user_phone?.toLowerCase().includes(term)) || 
        (booking.pet_details?.toLowerCase().includes(term)) ||
        (booking.time?.includes(term))
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    // Filter by service type
    if (filterServiceType !== "all") {
      filtered = filtered.filter(booking => booking.service_type === filterServiceType);
    }

    // Show only today's bookings
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.date);
      return isToday(bookingDate);
    });

    setFilteredBookings(filtered);
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

  const formatBookingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, 'dd MMM yyyy');
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterServiceType("all");
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0dcf6a]" />
              <span>Today's Appointments</span>
            </div>
            <div className="text-sm font-normal text-gray-500">
              {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, phone, or pet details"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterServiceType}
                onValueChange={setFilterServiceType}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || filterStatus !== "all" || filterServiceType !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No bookings found for today</p>
              {(searchTerm || filterStatus !== "all" || filterServiceType !== "all") && (
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters to see all bookings
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <div className="flex items-start gap-2">
                      <div className="bg-[#E5DEFF] text-[#7E69AB] p-2 rounded-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-lg font-medium">{booking.time}</span>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge variant="outline" className={booking.service_type === 'home' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                            <span className="flex items-center gap-1">
                              {booking.service_type === 'home' ? 
                                <Home className="h-4 w-4" /> : 
                                <Store className="h-4 w-4" />
                              }
                              {booking.service_type === 'home' ? 'Home Visit' : 'At Salon'}
                            </span>
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{booking.user_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{booking.user_phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelDialog(true);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2">
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

                  <div className="mt-2 text-xs text-gray-500">
                    Booked {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep appointment</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedBooking && handleCancelBooking(selectedBooking)}
            >
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
