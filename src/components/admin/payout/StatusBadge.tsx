
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "waiting_for_review":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Awaiting Review</Badge>;
    case "processing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
    case "payment_sent":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Payment Sent</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
  }
}
