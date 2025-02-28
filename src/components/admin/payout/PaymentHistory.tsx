
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PayoutRequest } from "./types";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDollarSign } from "lucide-react";

interface PaymentHistoryProps {
  eventId?: string;
}

export function PaymentHistory({ eventId }: PaymentHistoryProps) {
  const [paymentHistory, setPaymentHistory] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBookingAmount, setTotalBookingAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  useEffect(() => {
    fetchPaymentHistory();
  }, [eventId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payout_requests')
        .select(`
          *,
          events:event_id (
            title,
            organizer_name,
            organizer_email
          )
        `)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch total booking amounts for all events or specific event
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('event_analytics')
        .select('event_id, total_amount')
        .eq(eventId ? 'event_id' : 'event_id', eventId || '');

      if (analyticsError) throw analyticsError;

      // Format the data
      const formattedData = data?.map(item => ({
        ...item,
        event_title: item.events?.title,
        organizer_name: item.events?.organizer_name,
        organizer_email: item.events?.organizer_email,
      })) || [];

      setPaymentHistory(formattedData);

      // Calculate totals
      if (analyticsData) {
        const totalAmount = analyticsData.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        setTotalBookingAmount(totalAmount);

        // Calculate total paid amount (from successful payouts)
        const paidAmount = formattedData
          .filter(item => item.status === 'payment_sent')
          .reduce((sum, item) => sum + (item.amount || 0), 0);
        setTotalPaidAmount(paidAmount);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <CircleDollarSign className="h-5 w-5 mr-2 text-blue-600" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-md p-3">
            <p className="text-sm text-blue-700">Total Booking Amount</p>
            <p className="text-xl font-bold">₹{totalBookingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-md p-3">
            <p className="text-sm text-green-700">Total Paid Amount</p>
            <p className="text-xl font-bold">₹{totalPaidAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              ({Math.round((totalPaidAmount / (totalBookingAmount || 1)) * 100)}% of total)
            </p>
          </div>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="overflow-auto max-h-[400px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.event_title || "Unknown Event"}</TableCell>
                    <TableCell>₹{payment.amount?.toLocaleString() || "Pending"}</TableCell>
                    <TableCell><StatusBadge status={payment.status} /></TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {payment.processed_at && payment.status === 'payment_sent' 
                        ? `Paid ${formatDistanceToNow(new Date(payment.processed_at), { addSuffix: true })}`
                        : `Requested ${formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}`
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            {eventId ? "No payment history for this event." : "No payment history available."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
