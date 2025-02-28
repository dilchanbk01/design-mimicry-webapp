
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Ban, Mail } from "lucide-react";

interface PayoutStatusButtonProps {
  status: string | null;
  isSubmitting: boolean;
  eventEnded: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export function PayoutStatusButton({ status, isSubmitting, eventEnded, onClick }: PayoutStatusButtonProps) {
  if (!status) {
    return (
      <Button
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        onClick={onClick}
        disabled={!eventEnded || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Request Payout"}
      </Button>
    );
  }

  switch (status) {
    case 'waiting_for_review':
      return (
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-white cursor-default"
          disabled
        >
          <Clock className="h-4 w-4 mr-2" />
          Waiting for Review
        </Button>
      );
    case 'processing':
      return (
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-default"
          disabled
        >
          <Mail className="h-4 w-4 mr-2" />
          Contact Pending
        </Button>
      );
    case 'payment_sent':
      return (
        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white cursor-default"
          disabled
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Payment Sent
        </Button>
      );
    case 'rejected':
      return (
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          onClick={onClick}
        >
          <Ban className="h-4 w-4 mr-2" />
          Request Rejected - Try Again
        </Button>
      );
    default:
      return (
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-white cursor-default"
          disabled
        >
          <Clock className="h-4 w-4 mr-2" />
          Request Pending
        </Button>
      );
  }
}
