
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { GroomerProfile } from "@/pages/pet-grooming/types";

interface PayoutHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroomer: GroomerProfile | null;
  payoutHistory: any[];
}

export function PayoutHistoryDialog({ 
  open, 
  onOpenChange, 
  selectedGroomer, 
  payoutHistory 
}: PayoutHistoryDialogProps) {
  
  const getPayoutStatusBadge = (status: string) => {
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Payout History - {selectedGroomer?.salon_name}</AlertDialogTitle>
        </AlertDialogHeader>
        {payoutHistory.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-3">
            {payoutHistory.map((payout) => (
              <div key={payout.id} className="border p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">₹{payout.amount.toFixed(2)}</div>
                  {getPayoutStatusBadge(payout.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Requested: {format(new Date(payout.created_at), 'PPP')}</span>
                  </div>
                  {payout.processed_at && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Processed: {format(new Date(payout.processed_at), 'PPP')}</span>
                    </div>
                  )}
                  {payout.week_start && payout.week_end && (
                    <div className="col-span-2 text-gray-600">
                      <span>Period: {format(new Date(payout.week_start), 'MMM d')} - {format(new Date(payout.week_end), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {payout.notes && (
                    <div className="col-span-2 italic text-gray-600">
                      <span>Notes: {payout.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No payout history found for this groomer.</p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
