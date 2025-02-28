
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check, X, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PayoutRequest } from "./payout/types";
import { StatusBadge } from "./payout/StatusBadge";
import { RequestDetailsDialog } from "./payout/RequestDetailsDialog";
import { PaymentProcessingDialog } from "./payout/PaymentProcessingDialog";
import { ActionConfirmationDialog } from "./payout/ActionConfirmationDialog";

interface PayoutRequestsSectionProps {
  searchQuery?: string;
}

export function PayoutRequestsSection({ searchQuery = "" }: PayoutRequestsSectionProps) {
  const { toast } = useToast();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; request: PayoutRequest | null }>({
    open: false,
    action: "",
    request: null,
  });

  useEffect(() => {
    fetchPayoutRequests();
  }, [sortColumn, sortDirection, searchQuery]);

  const fetchPayoutRequests = async () => {
    try {
      setLoading(true);

      // Fetch payout requests with event details
      const { data, error } = await supabase
        .from("payout_requests")
        .select(`
          *,
          events!inner (
            id,
            title,
            organizer_name,
            organizer_email
          )
        `)
        .order(sortColumn, { ascending: sortDirection === "asc" });

      if (error) throw error;

      // Transform data to include event_title and other fields
      let transformedData = data.map((item) => ({
        ...item,
        event_title: item.events?.title || "Unknown Event",
        organizer_name: item.events?.organizer_name || "Unknown Organizer",
        organizer_email: item.events?.organizer_email || "",
      }));

      // Apply search filter if searchQuery is provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        transformedData = transformedData.filter(
          (request) =>
            request.event_title.toLowerCase().includes(query) ||
            request.organizer_name.toLowerCase().includes(query) ||
            request.organizer_email.toLowerCase().includes(query)
        );
      }

      setPayoutRequests(transformedData);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      toast({
        title: "Error",
        description: "Failed to load payout requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ChevronsUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleViewDetails = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleProcessRequest = (request: PayoutRequest) => {
    setSelectedRequest(request);
    
    // For analyzing event revenue
    fetchEventAnalytics(request.event_id);
    
    setShowReviewForm(true);
  };

  const fetchEventAnalytics = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_analytics')
        .select('*')
        .eq('event_id', eventId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPaymentAmount(data.total_amount || 0);
      }
    } catch (error) {
      console.error("Error fetching event analytics:", error);
    }
  };

  const handleRejectRequest = (request: PayoutRequest) => {
    setActionDialog({
      open: true,
      action: "reject",
      request,
    });
  };

  const handleSendPayment = async () => {
    if (!selectedRequest) return;
    
    try {
      const now = new Date().toISOString();
      
      // Update the payout request status
      const { error } = await supabase
        .from("payout_requests")
        .update({
          status: "payment_sent",
          processed_at: now,
          amount: paymentAmount
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment has been marked as sent",
      });

      // Refresh list
      fetchPayoutRequests();
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error updating payout request:", error);
      toast({
        title: "Error",
        description: "Failed to update payout request",
        variant: "destructive",
      });
    }
  };

  const confirmAction = async () => {
    if (!actionDialog.request) return;

    try {
      const now = new Date().toISOString();
      let newStatus = "";
      let actionMessage = "";

      switch (actionDialog.action) {
        case "reject":
          newStatus = "rejected";
          actionMessage = "Payout request has been rejected";
          break;
      }

      const { error } = await supabase
        .from("payout_requests")
        .update({
          status: newStatus,
          processed_at: now,
        })
        .eq("id", actionDialog.request.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: actionMessage,
      });

      // Refresh list
      fetchPayoutRequests();
    } catch (error) {
      console.error("Error updating payout request:", error);
      toast({
        title: "Error",
        description: "Failed to update payout request",
        variant: "destructive",
      });
    } finally {
      setActionDialog({ open: false, action: "", request: null });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full h-10 animate-pulse bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  const getActionButtons = (request: PayoutRequest) => {
    switch (request.status) {
      case "waiting_for_review":
      case "processing":
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                handleProcessRequest(request);
              }}
            >
              Process Payment
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRejectRequest(request);
              }}
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Payout Requests</h3>

      {payoutRequests.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No payout requests found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[200px] cursor-pointer"
                    onClick={() => handleSort("events.title")}
                  >
                    <div className="flex items-center">
                      Event {getSortIcon("events.title")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Requested {getSortIcon("created_at")}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(request)}>
                    <TableCell className="font-medium">{request.event_title}</TableCell>
                    <TableCell>{format(new Date(request.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell className="text-right">
                      <div onClick={(e) => e.stopPropagation()}>
                        {getActionButtons(request)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Details Dialog */}
          <RequestDetailsDialog
            request={selectedRequest}
            open={showDetails}
            onOpenChange={setShowDetails}
            actionButtons={selectedRequest ? getActionButtons(selectedRequest) : null}
          />

          {/* Payment Processing Dialog */}
          <PaymentProcessingDialog
            request={selectedRequest}
            open={showReviewForm}
            onOpenChange={setShowReviewForm}
            paymentAmount={paymentAmount}
            onPaymentAmountChange={setPaymentAmount}
            onSendPayment={handleSendPayment}
          />

          {/* Action Confirmation Dialog */}
          <ActionConfirmationDialog
            actionType={actionDialog.action}
            request={actionDialog.request}
            open={actionDialog.open}
            onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
            onConfirm={confirmAction}
          />
        </>
      )}
    </div>
  );
}
