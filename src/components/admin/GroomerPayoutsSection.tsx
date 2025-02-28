
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, CircleDollarSign, Scissors } from 'lucide-react';
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

interface GroomerPayout {
  id: string;
  groomer_id: string;
  amount: number;
  status: string;
  week_start: string | null;
  week_end: string | null;
  processed_at: string | null;
  created_at: string;
  salon_name?: string;
  contact_number?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
}

export function GroomerPayoutsSection() {
  const [payoutRequests, setPayoutRequests] = useState<GroomerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<GroomerPayout | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayoutRequests();
  }, [selectedFilter]);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      // Join with groomer_profiles to get the groomer details
      const { data: requestsWithGroomers, error: requestsError } = await supabase
        .from('groomer_payouts')
        .select(`
          *,
          groomer_profiles:groomer_id (salon_name, contact_number)
        `)
        .eq('status', selectedFilter)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get bank details separately
      let processedRequests = [];
      if (requestsWithGroomers && requestsWithGroomers.length > 0) {
        processedRequests = await Promise.all(requestsWithGroomers.map(async (request) => {
          // Get bank details
          const { data: bankDetails, error: bankError } = await supabase
            .from('groomer_bank_details')
            .select('account_name, account_number, ifsc_code')
            .eq('groomer_id', request.groomer_id)
            .maybeSingle();
          
          if (bankError && bankError.code !== 'PGRST116') {
            console.error('Error fetching bank details:', bankError);
          }

          return {
            ...request,
            salon_name: request.groomer_profiles?.salon_name || 'Unknown Groomer',
            contact_number: request.groomer_profiles?.contact_number || 'No contact provided',
            account_name: bankDetails?.account_name || 'Not provided',
            account_number: bankDetails?.account_number || 'Not provided',
            ifsc_code: bankDetails?.ifsc_code || 'Not provided'
          };
        }));
      }
      
      setPayoutRequests(processedRequests);
    } catch (error) {
      console.error('Error fetching groomer payout requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groomer payout requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('groomer_payouts')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Request Approved',
        description: 'The groomer payout request has been approved successfully.',
      });
      
      setShowConfirmDialog(false);
      setSelectedRequest(null);
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve the request',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('groomer_payouts')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Request Rejected',
        description: 'The groomer payout request has been rejected.',
      });
      
      setShowRejectDialog(false);
      setSelectedRequest(null);
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject the request',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatAccountNumber = (number: string) => {
    // Show only last 4 digits for security
    const lastFour = number.slice(-4);
    return `XXXX-XXXX-${lastFour}`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Scissors className="h-5 w-5 mr-2 text-purple-600" />
          Groomer Payout Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" onValueChange={setSelectedFilter}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : payoutRequests.length === 0 ? (
            <div className="text-center py-8">
              <CircleDollarSign className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No {selectedFilter} groomer payout requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payoutRequests.map(request => (
                <div 
                  key={request.id}
                  className="border p-4 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{request.salon_name}</h3>
                      <p className="text-sm text-gray-500">Contact: {request.contact_number}</p>
                      <p className="text-sm text-gray-500">
                        Period: {request.week_start && request.week_end ? (
                          `${format(new Date(request.week_start), 'MMM d')} - ${format(new Date(request.week_end), 'MMM d, yyyy')}`
                        ) : 'Not specified'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm text-gray-500">
                          Requested on {format(new Date(request.created_at), 'PPP')}
                        </p>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-xl font-bold text-green-600">₹{request.amount.toFixed(2)}</div>
                      <div className="text-sm mt-1">
                        <p className="text-gray-500">Account: {request.account_name}</p>
                        <p className="text-gray-500">Number: {formatAccountNumber(request.account_number)}</p>
                        <p className="text-gray-500">IFSC: {request.ifsc_code}</p>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectDialog(true);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowConfirmDialog(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                      
                      {request.status !== 'pending' && request.processed_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} on {format(new Date(request.processed_at), 'PPP')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Groomer Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this payout request for {selectedRequest?.salon_name}?
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p><strong>Amount:</strong> ₹{selectedRequest?.amount.toFixed(2)}</p>
                <p><strong>Account Name:</strong> {selectedRequest?.account_name}</p>
                <p><strong>Account Number:</strong> {selectedRequest?.account_number}</p>
                <p><strong>IFSC Code:</strong> {selectedRequest?.ifsc_code}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={processingAction}
              onClick={(e) => {
                e.preventDefault();
                handleApprove();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingAction ? "Processing..." : "Yes, Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Groomer Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this payout request from {selectedRequest?.salon_name} for ₹{selectedRequest?.amount.toFixed(2)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={processingAction}
              onClick={(e) => {
                e.preventDefault();
                handleReject();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingAction ? "Processing..." : "Yes, Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
