
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PayoutRequest } from "./types";

interface PaymentProcessingDialogProps {
  request: PayoutRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentAmount: number;
  onPaymentAmountChange: (amount: number) => void;
  onSendPayment: () => void;
}

export function PaymentProcessingDialog({
  request,
  open,
  onOpenChange,
  paymentAmount,
  onPaymentAmountChange,
  onSendPayment
}: PaymentProcessingDialogProps) {
  if (!request) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Enter payment details for this payout request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{request.event_title}</p>
              <p className="text-sm text-gray-600">Organizer: {request.organizer_name}</p>
              <p className="text-sm text-gray-600">{request.organizer_email}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bank Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>Account Name: <span className="font-medium">{request.account_name}</span></p>
                <p>Account Number: <span className="font-medium">{request.account_number}</span></p>
                <p>IFSC Code: <span className="font-medium">{request.ifsc_code}</span></p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <label className="text-sm font-medium">
              Payment Amount (₹)
              <Input 
                type="number" 
                value={paymentAmount}
                onChange={(e) => onPaymentAmountChange(Number(e.target.value))}
                className="mt-1"
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onSendPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-1" /> Mark as Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
