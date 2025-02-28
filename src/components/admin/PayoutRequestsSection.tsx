
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, CircleDollarSign, Search, UserIcon, Calendar, AtSign, PhoneIcon, Globe, MapPin } from 'lucide-react';
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
  organizer_phone?: string;
  event_date?: string;
  event_location?: string;
  event_price?: number;
  organizer_website?: string;
}

interface PayoutRequestsSectionProps {
  searchQuery?: string;
}

export function PayoutRequestsSection({ searchQuery = '' }: PayoutRequestsSectionProps) {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPayoutRequests();
  }, [selectedFilter]);

  useEffect(() => {
    // Apply parent component search query when it changes
    if (searchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Filter requests based on search query
    const query = searchQuery || localSearchQuery;
    if (query) {
      const filtered = payoutRequests.filter(request => 
        request.event_title?.toLowerCase().includes(query.toLowerCase()) ||
        request.organizer_name?.toLowerCase().includes(query.toLowerCase()) ||
        request.organizer_email?.toLowerCase().includes(query.toLowerCase()) ||
        request.account_name.toLowerCase().includes(query.toLowerCase()) ||
        request.event_location?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(payoutRequests);
    }
  }, [payoutRequests, searchQuery, localSearchQuery]);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      // Join with events to get the event title
      const { data: requestsWithEvents, error: requestsError } = await supabase
        .from('payout_requests')
        .select(`
          *,
          events:event_id (title, organizer_name, organizer_email, organizer_phone, date, location, price, organizer_website)
        `)
        .eq('status', selectedFilter)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get organizer details separately since we can't directly join with auth.users
      let processedRequests = [];
      if (requestsWithEvents && requestsWithEvents.length > 0) {
        processedRequests = requestsWithEvents.map(request => {
          return {
            ...request,
            event_title: request.events?.title || 'Unknown Event',
            organizer_name: request.events?.organizer_name || 'Event Organizer',
            organizer_email: request.events?.organizer_email || '',
            organizer_phone: request.events?.organizer_phone || '',
            event_date: request.events?.date || '',
            event_location: request.events?.location || '',
            event_price: request.events?.price || 0,
            organizer_website: request.events?.organizer_website || ''
          };
        });
      }
      
      setPayoutRequests(processedRequests);
      setFilteredRequests(processedRequests);
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
        {!searchQuery && (
          <div className="mb-4 relative">
            <Input
              type="text"
              placeholder="Search by organizer, event title, or location..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        )}

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
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <CircleDollarSign className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                {localSearchQuery || searchQuery 
                  ? "No payout requests matching your search" 
                  : `No ${selectedFilter} payout requests found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <div 
                  key={request.id}
                  className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{request.event_title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                        <p className="text-sm flex items-center">
                          <UserIcon className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.organizer_name}
                        </p>
                        <p className="text-sm flex items-center">
                          <AtSign className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.organizer_email}
                        </p>
                        {request.organizer_phone && (
                          <p className="text-sm flex items-center">
                            <PhoneIcon className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.organizer_phone}
                          </p>
                        )}
                        {request.organizer_website && (
                          <p className="text-sm flex items-center">
                            <Globe className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.organizer_website}
                          </p>
                        )}
                        {request.event_date && (
                          <p className="text-sm flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" /> {format(new Date(request.event_date), 'PPP')}
                          </p>
                        )}
                        {request.event_location && (
                          <p className="text-sm flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.event_location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <p className="text-xs text-gray-500">
                          Submitted on {format(new Date(request.created_at), 'PPP')}
                        </p>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex flex-col items-start lg:items-end">
                      <div className="text-xl font-bold text-green-600 mb-2">
                        ₹{request.amount?.toFixed(2) || request.event_price?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500"><span className="font-medium">Account:</span> {request.account_name}</p>
                        <p className="text-gray-500"><span className="font-medium">Number:</span> {formatAccountNumber(request.account_number)}</p>
                        <p className="text-gray-500"><span className="font-medium">IFSC:</span> {request.ifsc_code}</p>
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
                <p><strong>Organizer:</strong> {selectedRequest?.organizer_name}</p>
                <p><strong>Email:</strong> {selectedRequest?.organizer_email}</p>
                <p><strong>Amount:</strong> ₹{selectedRequest?.amount?.toFixed(2) || selectedRequest?.event_price?.toFixed(2) || 'N/A'}</p>
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
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p><strong>Organizer:</strong> {selectedRequest?.organizer_name}</p>
                <p><strong>Email:</strong> {selectedRequest?.organizer_email}</p>
                <p><strong>Amount:</strong> ₹{selectedRequest?.amount?.toFixed(2) || selectedRequest?.event_price?.toFixed(2) || 'N/A'}</p>
              </div>
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
