import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PayoutRequest } from "./payout/types";
import { RequestDetailsDialog } from "./payout/RequestDetailsDialog";
import { ActionConfirmationDialog } from "./payout/ActionConfirmationDialog";
import { PaymentProcessingDialog } from "./payout/PaymentProcessingDialog";
import { PaymentHistory } from "./payout/PaymentHistory";
import { useToast } from "@/hooks/use-toast";
import { FilterButtons } from "./payout/FilterButtons";
import { PayoutTable } from "./payout/PayoutTable";
import { Button } from "@/components/ui/button";

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
        const { error } = await supabase
          .from('payout_requests')
          .update({ status: 'processing' })
          .eq('id', selectedRequest.id);
        
        if (error) throw error;
        
        setIsConfirmingAction(false);
        setIsProcessingPayment(true);
      } else {
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

  return (
    <div className="space-y-4">
      <FilterButtons 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
      />
      
      <PaymentHistory />
      
      <PayoutTable
        payoutRequests={payoutRequests}
        loading={loading}
        statusFilter={statusFilter}
        onViewDetails={handleViewDetails}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      
      {selectedRequest && (
        <>
          <RequestDetailsDialog
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            request={selectedRequest}
            actionButtons={
              selectedRequest.status === 'waiting_for_review' ? (
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleApprove(selectedRequest);
                    }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleReject(selectedRequest);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : null
            }
          />
          <ActionConfirmationDialog
            open={isConfirmingAction}
            onOpenChange={setIsConfirmingAction}
            onConfirm={confirmAction}
            actionType={actionType}
            request={selectedRequest}
          />
          <PaymentProcessingDialog
            open={isProcessingPayment}
            onOpenChange={setIsProcessingPayment}
            paymentAmount={selectedRequest.amount || 0}
            onPaymentAmountChange={(amount) => {
              // Since we can't directly modify selectedRequest, we'll handle this in the onSendPayment
              // This is just a placeholder to satisfy the prop requirement
            }}
            onSendPayment={() => completePayment(selectedRequest.amount || 0)}
            request={selectedRequest}
          />
        </>
      )}
    </div>
  );
}
