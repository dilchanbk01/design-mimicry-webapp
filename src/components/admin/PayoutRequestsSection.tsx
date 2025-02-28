
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, CircleDollarSign } from 'lucide-react';
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

interface PayoutRequest {
  id: string;
  event_id: string;
  organizer_id: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  amount: number | null;
  event_title?: string;
  organizer_name?: string;
  organizer_email?: string;
}

export function PayoutRequestsSection() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
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
      // Fetch payout requests with event and organizer details
      const { data, error } = await supabase
        .from('payout_requests')
        .select(`
          *,
          events:event_id (
            title
          ),
          profiles:organizer_id (
            full_name,
            email
          )
        `)
        .eq('status', selectedFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData = data.map(item => ({
          ...item,
          event_title: item.events?.title || 'Unknown Event',
          organizer_name: item.profiles?.full_name || 'Unknown Organizer',
          organizer_email: item.profiles?.email || ''
        }));
        
        setPayoutRequests(formattedData);
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payout requests',
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
        .from('payout_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Request Approved',
        description: 'The payout request has been approved successfully.',
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
        .from('payout_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Request Rejected',
        description: 'The payout request has been rejected.',
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
          <CircleDollarSign className="h-5 w-5 mr-2 text-blue-600" />
          Payout Requests
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
              <p className="text-gray-500">No {selectedFilter} payout requests found</p>
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
                      <h3 className="font-medium">{request.event_title}</h3>
                      <p className="text-sm text-gray-500">Organizer: {request.organizer_name}</p>
                      <p className="text-sm text-gray-500">Account: {request.account_name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-500">
                          Submitted on {format(new Date(request.created_at), 'PPP')}
                        </p>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-sm">
                        <p className="text-gray-500">Account: {formatAccountNumber(request.account_number)}</p>
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
            <AlertDialogTitle>Approve Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this payout request for {selectedRequest?.event_title}?
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
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
            <AlertDialogTitle>Reject Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this payout request for {selectedRequest?.event_title}?
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
