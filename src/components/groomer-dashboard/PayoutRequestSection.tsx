
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, endOfWeek, startOfWeek, isToday, isAfter, isFriday } from "date-fns";
import { AlertCircle, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PayoutRequestSectionProps {
  groomerId: string;
  weeklyRevenue: number;
}

export function PayoutRequestSection({ groomerId, weeklyRevenue }: PayoutRequestSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const isFridayToday = isFriday(today);
  const startDate = startOfWeek(today);
  const endDate = endOfWeek(today);
  
  // Check if today is after the most recent Friday
  // If it's Friday today, this will be true
  const canRequestPayout = isFridayToday;
  
  useEffect(() => {
    checkBankDetails();
    fetchPendingPayouts();
  }, [groomerId]);
  
  const checkBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('groomer_bank_details')
        .select('id')
        .eq('groomer_id', groomerId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking bank details:", error);
        throw error;
      }
      
      setHasBankDetails(!!data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const fetchPendingPayouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groomer_payouts')
        .select('*')
        .eq('groomer_id', groomerId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setPendingPayouts(data || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast({
        title: "Error",
        description: "Failed to load payout history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestPayout = async () => {
    if (!hasBankDetails) {
      toast({
        title: "Bank details required",
        description: "Please add your bank details before requesting a payout",
        variant: "destructive",
      });
      return;
    }
    
    if (weeklyRevenue <= 0) {
      toast({
        title: "No revenue",
        description: "You don't have any revenue to withdraw this week",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('groomer_payouts')
        .insert({
          groomer_id: groomerId,
          amount: weeklyRevenue,
          status: 'pending',
          week_start: startDate.toISOString(),
          week_end: endDate.toISOString()
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });
      
      fetchPendingPayouts();
    } catch (error) {
      console.error("Error requesting payout:", error);
      toast({
        title: "Error",
        description: "Failed to submit payout request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Weekly Payout</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingPayouts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Weekly Revenue</span>
              <Badge>
                {format(startDate, "dd MMM")} - {format(endDate, "dd MMM")}
              </Badge>
            </div>
            <div className="flex items-center text-2xl font-bold">
              <DollarSign className="h-6 w-6 text-green-500 mr-1" />
              ₹{weeklyRevenue.toFixed(2)}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRequestPayout}
              disabled={!canRequestPayout || submitting || !hasBankDetails || weeklyRevenue <= 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Processing..." : "Request Payout"}
            </Button>
            
            {!hasBankDetails && (
              <div className="flex items-center text-amber-600 text-xs mt-1">
                <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Add bank details first</span>
              </div>
            )}
            
            {!canRequestPayout && (
              <div className="flex items-center text-amber-600 text-xs mt-1">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Payouts can only be requested on Fridays</span>
              </div>
            )}
          </div>
          
          {pendingPayouts.length > 0 ? (
            <div className="space-y-3 mt-4">
              <h4 className="font-medium text-sm">Recent Payout Requests</h4>
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">₹{payout.amount.toFixed(2)}</span>
                    <Badge 
                      variant={
                        payout.status === 'approved' ? 'default' :
                        payout.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {payout.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Requested on {format(new Date(payout.created_at), "dd MMM yyyy")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No payout requests yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
