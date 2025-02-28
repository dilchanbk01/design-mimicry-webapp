
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check, X, ChevronDown, ChevronUp, ChevronsUpDown, FileCheck, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PayoutRequest {
  id: string;
  event_id: string;
  organizer_id: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  status: string;
  processed_at: string | null;
  created_at: string;
  amount: number | null;
  event_title?: string;
  organizer_name?: string;
  organizer_email?: string;
}

export function PayoutRequestsSection() {
  const { toast } = useToast();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; request: PayoutRequest | null }>({
    open: false,
    action: "",
    request: null,
  });

  useEffect(() => {
    fetchPayoutRequests();
  }, [sortColumn, sortDirection]);

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
      const transformedData = data.map((item) => ({
        ...item,
        event_title: item.events?.title || "Unknown Event",
        organizer_name: item.events?.organizer_name || "Unknown Organizer",
        organizer_email: item.events?.organizer_email || "",
      }));

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting_for_payment":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Waiting for Payment</Badge>;
      case "payment_received":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Payment Received</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
    }
  };

  const handleMarkAsPaid = (request: PayoutRequest) => {
    setActionDialog({
      open: true,
      action: "mark_paid",
      request,
    });
  };

  const handleApproveRequest = (request: PayoutRequest) => {
    setActionDialog({
      open: true,
      action: "approve",
      request,
    });
  };

  const handleRejectRequest = (request: PayoutRequest) => {
    setActionDialog({
      open: true,
      action: "reject",
      request,
    });
  };

  const confirmAction = async () => {
    if (!actionDialog.request) return;

    try {
      const now = new Date().toISOString();
      let newStatus = "";
      let actionMessage = "";

      switch (actionDialog.action) {
        case "mark_paid":
          newStatus = "payment_received";
          actionMessage = "Payment has been marked as sent";
          break;
        case "approve":
          newStatus = "approved";
          actionMessage = "Payout request has been approved";
          break;
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
      case "waiting_for_payment":
        return (
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            onClick={() => handleMarkAsPaid(request)}
          >
            Mark as Paid
          </Button>
        );
      case "payment_received":
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              onClick={() => handleApproveRequest(request)}
            >
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              onClick={() => handleRejectRequest(request)}
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
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
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
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Payout Request Details</DialogTitle>
                <DialogDescription>
                  Review the details of this payout request
                </DialogDescription>
              </DialogHeader>

              {selectedRequest && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Event</p>
                      <p>{selectedRequest.event_title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p>{getStatusBadge(selectedRequest.status)}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Organizer</p>
                    <p>{selectedRequest.organizer_name}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.organizer_email}</p>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-500 mb-2">Bank Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Account Name</p>
                        <p className="font-medium">{selectedRequest.account_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">IFSC Code</p>
                        <p className="font-medium">{selectedRequest.ifsc_code}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="font-medium">{selectedRequest.account_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-500 mb-2">Timeline</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Requested</span>
                        <span>{format(new Date(selectedRequest.created_at), "MMM d, yyyy")}</span>
                      </div>
                      {selectedRequest.processed_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Processed</span>
                          <span>{format(new Date(selectedRequest.processed_at), "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="sm:justify-start">
                {selectedRequest && getActionButtons(selectedRequest)}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Action Confirmation Dialog */}
          <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {actionDialog.action === "mark_paid" && "Mark Payment as Sent"}
                  {actionDialog.action === "approve" && "Approve Payout Request"}
                  {actionDialog.action === "reject" && "Reject Payout Request"}
                </DialogTitle>
                <DialogDescription>
                  {actionDialog.action === "mark_paid" && "Confirm that you have sent the payment to the organizer's bank account."}
                  {actionDialog.action === "approve" && "Confirm that the payout request is approved and the payment process is complete."}
                  {actionDialog.action === "reject" && "Reject the payout request. The organizer will be able to submit a new request."}
                </DialogDescription>
              </DialogHeader>

              {actionDialog.request && (
                <div className="py-3">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">{actionDialog.request.event_title}</p>
                    <p className="text-sm text-gray-600">Organizer: {actionDialog.request.organizer_name}</p>
                    {actionDialog.action === "mark_paid" && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium">Bank Details:</p>
                        <p className="text-sm">{actionDialog.request.account_name}</p>
                        <p className="text-sm">Acc: {actionDialog.request.account_number}</p>
                        <p className="text-sm">IFSC: {actionDialog.request.ifsc_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setActionDialog({ open: false, action: "", request: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionDialog.action === "reject" ? "destructive" : "default"}
                  className={actionDialog.action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={confirmAction}
                >
                  {actionDialog.action === "mark_paid" && (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Confirm Payment Sent
                    </>
                  )}
                  {actionDialog.action === "approve" && (
                    <>
                      <FileCheck className="h-4 w-4 mr-1" /> Approve
                    </>
                  )}
                  {actionDialog.action === "reject" && (
                    <>
                      <Ban className="h-4 w-4 mr-1" /> Reject
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
