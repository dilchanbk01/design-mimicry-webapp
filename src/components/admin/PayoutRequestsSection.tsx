
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PayoutRequest } from "./payout/types";
import { StatusBadge } from "./payout/StatusBadge";
import { RequestDetailsDialog } from "./payout/RequestDetailsDialog";
import { ActionConfirmationDialog } from "./payout/ActionConfirmationDialog";
import { PaymentProcessingDialog } from "./payout/PaymentProcessingDialog";
import { PaymentHistory } from "./payout/PaymentHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CircleDollarSign,
  Filter
} from "lucide-react";

interface PayoutRequestsSectionProps {
  searchQuery: string;
}

export function PayoutRequestsSection({ searchQuery }: PayoutRequestsSectionProps) {
  const { toast } = useToast();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchPayoutRequests();
  }, [searchQuery, statusFilter]);

  const fetchPayoutRequests = async () => {
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
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format the data and filter based on search query
      const formattedData = data
        ?.map(item => ({
          ...item,
          event_title: item.events?.title,
          organizer_name: item.events?.organizer_name,
          organizer_email: item.events?.organizer_email
        }))
        .filter(item => {
          if (!searchQuery) return true;
          
          const searchLower = searchQuery.toLowerCase();
          return (
            (item.event_title?.toLowerCase().includes(searchLower) || false) ||
            (item.organizer_name?.toLowerCase().includes(searchLower) || false) ||
            (item.organizer_email?.toLowerCase().includes(searchLower) || false) ||
            (item.account_name.toLowerCase().includes(searchLower)) ||
            (item.account_number.includes(searchQuery)) ||
            (item.ifsc_code.toLowerCase().includes(searchLower))
          );
        });
      
      setPayoutRequests(formattedData || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleApprove = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setActionType("approve");
    setIsConfirmingAction(true);
  };

  const handleReject = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setActionType("reject");
    setIsConfirmingAction(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;
    
    try {
      if (actionType === "approve") {
        // First change status to processing
        const { error } = await supabase
          .from('payout_requests')
          .update({ status: 'processing' })
          .eq('id', selectedRequest.id);
        
        if (error) throw error;
        
        setIsConfirmingAction(false);
        setIsProcessingPayment(true);
      } else {
        // Reject the request
        const { error } = await supabase
          .from('payout_requests')
          .update({ 
            status: 'rejected',
            processed_at: new Date().toISOString()
          })
          .eq('id', selectedRequest.id);
        
        if (error) throw error;
        
        toast({
          title: "Request Rejected",
          description: "The payout request has been rejected",
        });
        
        setIsConfirmingAction(false);
        fetchPayoutRequests();
      }
    } catch (error) {
      console.error('Error updating payout request:', error);
      toast({
        title: "Error",
        description: "Failed to update payout request",
        variant: "destructive",
      });
      setIsConfirmingAction(false);
    }
  };

  const completePayment = async (amount: number) => {
    if (!selectedRequest) return;
    
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ 
          status: 'payment_sent',
          processed_at: new Date().toISOString(),
          amount: amount
        })
        .eq('id', selectedRequest.id);
      
      if (error) throw error;
      
      toast({
        title: "Payment Completed",
        description: "The payment has been marked as sent",
      });
      
      setIsProcessingPayment(false);
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error completing payment:', error);
      toast({
        title: "Error",
        description: "Failed to complete payment",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const getFilterButtonClass = (status: string | null) => {
    return `px-3 py-1 text-xs rounded-full ${
      statusFilter === status
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="flex items-center mr-2">
          <Filter className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm text-gray-500">Filter:</span>
        </div>
        <button
          className={getFilterButtonClass(null)}
          onClick={() => setStatusFilter(null)}
        >
          All
        </button>
        <button
          className={getFilterButtonClass('waiting_for_review')}
          onClick={() => setStatusFilter('waiting_for_review')}
        >
          <Clock className="h-3 w-3 inline mr-1" />
          Awaiting Review
        </button>
        <button
          className={getFilterButtonClass('processing')}
          onClick={() => setStatusFilter('processing')}
        >
          <CircleDollarSign className="h-3 w-3 inline mr-1" />
          Processing
        </button>
        <button
          className={getFilterButtonClass('payment_sent')}
          onClick={() => setStatusFilter('payment_sent')}
        >
          <CheckCircle className="h-3 w-3 inline mr-1" />
          Completed
        </button>
        <button
          className={getFilterButtonClass('rejected')}
          onClick={() => setStatusFilter('rejected')}
        >
          <XCircle className="h-3 w-3 inline mr-1" />
          Rejected
        </button>
      </div>
      
      <PaymentHistory />
      
      {payoutRequests.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.event_title || "Unknown Event"}</TableCell>
                  <TableCell>
                    {request.organizer_name || "Unknown"}
                    {request.organizer_email && (
                      <div className="text-xs text-gray-500">{request.organizer_email}</div>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{request.account_name}</div>
                    <div className="text-xs text-gray-500">
                      {request.account_number} • {request.ifsc_code}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(request)}
                      >
                        Details
                      </Button>
                      {request.status === 'waiting_for_review' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleApprove(request)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleReject(request)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500">No payout requests found{statusFilter ? ` with status: ${statusFilter}` : ''}.</p>
        </div>
      )}
      
      {selectedRequest && (
        <>
          <RequestDetailsDialog
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            request={selectedRequest}
          />
          <ActionConfirmationDialog
            isOpen={isConfirmingAction}
            onClose={() => setIsConfirmingAction(false)}
            onConfirm={confirmAction}
            actionType={actionType}
            request={selectedRequest}
          />
          <PaymentProcessingDialog
            isOpen={isProcessingPayment}
            onClose={() => setIsProcessingPayment(false)}
            onComplete={completePayment}
            request={selectedRequest}
          />
        </>
      )}
    </div>
  );
}
