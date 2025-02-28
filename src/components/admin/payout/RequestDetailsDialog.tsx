
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PayoutRequest } from "./types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";

interface RequestDetailsDialogProps {
  request: PayoutRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionButtons: React.ReactNode;
}

export function RequestDetailsDialog({ 
  request, 
  open, 
  onOpenChange,
  actionButtons 
}: RequestDetailsDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payout Request Details</DialogTitle>
          <DialogDescription>
            Review the details of this payout request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Event</p>
              <p>{request.event_title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <StatusBadge status={request.status} />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Organizer</p>
            <p>{request.organizer_name}</p>
            <p className="text-sm text-gray-500">{request.organizer_email}</p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-500 mb-1">Bank Details</p>
            <div className="space-y-1">
              <p>Account Name: <span className="font-medium">{request.account_name}</span></p>
              <p>Account Number: <span className="font-medium">{request.account_number}</span></p>
              <p>IFSC Code: <span className="font-medium">{request.ifsc_code}</span></p>
            </div>
          </div>

          {request.amount && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-gray-500 mb-1">Payment</p>
              <p className="font-medium text-green-600">₹{request.amount}</p>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-500 mb-2">Timeline</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Requested</span>
                <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
              </div>
              {request.processed_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processed</span>
                  <span>{format(new Date(request.processed_at), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          {actionButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
