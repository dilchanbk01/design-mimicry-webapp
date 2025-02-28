
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, CircleDollarSign, Scissors, Search, UserIcon, PhoneIcon, MapPin, CalendarRange } from 'lucide-react';
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
  address?: string;
  email?: string;
  experience_years?: number;
  notes?: string;
}

interface GroomerPayoutsSectionProps {
  searchQuery?: string;
}

export function GroomerPayoutsSection({ searchQuery = '' }: GroomerPayoutsSectionProps) {
  const [payoutRequests, setPayoutRequests] = useState<GroomerPayout[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GroomerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<GroomerPayout | null>(null);
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
        request.salon_name?.toLowerCase().includes(query.toLowerCase()) ||
        request.contact_number?.toLowerCase().includes(query.toLowerCase()) ||
        request.account_name?.toLowerCase().includes(query.toLowerCase()) ||
        request.address?.toLowerCase().includes(query.toLowerCase()) ||
        request.email?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(payoutRequests);
    }
  }, [payoutRequests, searchQuery, localSearchQuery]);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      // Join with groomer_profiles to get the groomer details
      const { data: requestsWithGroomers, error: requestsError } = await supabase
        .from('groomer_payouts')
        .select(`
          *,
          groomer_profiles:groomer_id (salon_name, contact_number, address, experience_years, user_id)
        `)
        .eq('status', selectedFilter)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get bank details and user information
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

          // Get user profile info
          const userId = request.groomer_profiles?.user_id;
          let userEmail = null;
          
          if (userId) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .maybeSingle();
              
            if (userError) {
              console.error('Error fetching user data:', userError);
            } else {
              userEmail = userData?.full_name;
            }
          }

          return {
            ...request,
            salon_name: request.groomer_profiles?.salon_name || 'Unknown Groomer',
            contact_number: request.groomer_profiles?.contact_number || 'No contact provided',
            address: request.groomer_profiles?.address || 'No address provided',
            experience_years: request.groomer_profiles?.experience_years || 0,
            account_name: bankDetails?.account_name || 'Not provided',
            account_number: bankDetails?.account_number || 'Not provided',
            ifsc_code: bankDetails?.ifsc_code || 'Not provided',
            email: userEmail || 'Unknown user'
          };
        }));
      }
      
      setPayoutRequests(processedRequests);
      setFilteredRequests(processedRequests);
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
    if (!number || number === 'Not provided') return number;
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
        {!searchQuery && (
          <div className="mb-4 relative">
            <Input
              type="text"
              placeholder="Search by salon name, contact, or location..."
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
                  : `No ${selectedFilter} groomer payout requests found`}
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
                      <h3 className="font-medium text-lg">{request.salon_name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                        <p className="text-sm flex items-center">
                          <UserIcon className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.email}
                        </p>
                        <p className="text-sm flex items-center">
                          <PhoneIcon className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.contact_number}
                        </p>
                        <p className="text-sm flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" /> {request.address}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500 mr-1">Experience:</span> {request.experience_years} years
                        </p>
                        <p className="text-sm col-span-2 flex items-center">
                          <CalendarRange className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          Period: {request.week_start && request.week_end ? (
                            `${format(new Date(request.week_start), 'MMM d')} - ${format(new Date(request.week_end), 'MMM d, yyyy')}`
                          ) : 'Not specified'}
                        </p>
                        {request.notes && (
                          <p className="text-sm col-span-2 italic">
                            <span className="text-gray-500 mr-1">Notes:</span> {request.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <p className="text-xs text-gray-500">
                          Requested on {format(new Date(request.created_at), 'PPP')}
                        </p>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex flex-col items-start lg:items-end">
                      <div className="text-xl font-bold text-green-600 mb-2">₹{request.amount.toFixed(2)}</div>
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
            <AlertDialogTitle>Approve Groomer Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this payout request for {selectedRequest?.salon_name}?
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p><strong>Groomer:</strong> {selectedRequest?.salon_name}</p>
                <p><strong>Contact:</strong> {selectedRequest?.contact_number}</p>
                <p><strong>Email/User:</strong> {selectedRequest?.email}</p>
                <p><strong>Amount:</strong> ₹{selectedRequest?.amount.toFixed(2)}</p>
                <p><strong>Account Name:</strong> {selectedRequest?.account_name}</p>
                <p><strong>Account Number:</strong> {selectedRequest?.account_number}</p>
                <p><strong>IFSC Code:</strong> {selectedRequest?.ifsc_code}</p>
                {selectedRequest?.week_start && selectedRequest?.week_end && (
                  <p><strong>Period:</strong> {format(new Date(selectedRequest.week_start), 'MMM d')} - {format(new Date(selectedRequest.week_end), 'MMM d, yyyy')}</p>
                )}
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
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p><strong>Groomer:</strong> {selectedRequest?.salon_name}</p>
                <p><strong>Contact:</strong> {selectedRequest?.contact_number}</p>
                <p><strong>Email/User:</strong> {selectedRequest?.email}</p>
                {selectedRequest?.week_start && selectedRequest?.week_end && (
                  <p><strong>Period:</strong> {format(new Date(selectedRequest.week_start), 'MMM d')} - {format(new Date(selectedRequest.week_end), 'MMM d, yyyy')}</p>
                )}
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
