
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Scissors, Clock, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroomingBooking {
  id: string;
  date: string;
  time: string;
  service_type: string;
  status: string;
  pet_details: string;
  package_name?: string;
  payment_id: string;
  groomer_name?: string;
  groomer_address?: string;
}

export function GroomingBookingsSection() {
  const [bookings, setBookings] = useState<GroomingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroomingBookings();
  }, []);

  const fetchGroomingBookings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grooming_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each booking
      const enhancedBookings = await Promise.all(
        (data || []).map(async (booking) => {
          try {
            // Get groomer details
            const { data: groomerData } = await supabase
              .from('groomer_profiles')
              .select('salon_name, address')
              .eq('id', booking.groomer_id)
              .single();

            // Get package details if available
            let packageName = "Standard Grooming";
            if (booking.package_id) {
              const { data: packageData } = await supabase
                .from('grooming_packages')
                .select('name')
                .eq('id', booking.package_id)
                .single();
              
              if (packageData) {
                packageName = packageData.name;
              }
            }

            return {
              ...booking,
              groomer_name: groomerData?.salon_name || "Unknown Groomer",
              groomer_address: groomerData?.address || "",
              package_name: packageName
            } as GroomingBooking;
          } catch (err) {
            console.error("Error fetching booking details:", err);
            return {
              ...booking,
              groomer_name: "Unknown Groomer",
              groomer_address: "",
              package_name: "Standard Grooming"
            } as GroomingBooking;
          }
        })
      );

      setBookings(enhancedBookings);
    } catch (error) {
      console.error("Error fetching grooming bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your grooming appointments",
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

  const isUpcoming = (bookingDate: string) => {
    const date = new Date(bookingDate);
    const today = new Date();
    return date >= today;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Scissors className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p>You haven't booked any grooming appointments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <div className={`h-1 ${isUpcoming(booking.date) ? 'bg-[#9b87f5]' : 'bg-gray-300'}`}></div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-lg">{booking.groomer_name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[200px]">{booking.groomer_address}</span>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-[#9b87f5]" />
                <span>
                  {format(parseISO(booking.date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-[#9b87f5]" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center text-sm">
                <Scissors className="h-4 w-4 mr-1 text-[#9b87f5]" />
                <span>{booking.package_name}</span>
              </div>
            </div>

            {booking.pet_details && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Pet details:</span> {booking.pet_details}
                </p>
              </div>
            )}

            {isUpcoming(booking.date) && (
              <div className="mt-3 text-xs text-right">
                <span className="text-gray-500">
                  Payment ID: {booking.payment_id.substring(0, 8)}...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
