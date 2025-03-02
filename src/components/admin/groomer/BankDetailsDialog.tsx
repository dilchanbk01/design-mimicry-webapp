
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "lucide-react";
import { GroomerProfile } from "@/pages/pet-grooming/types";

interface BankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroomer: GroomerProfile | null;
  bankDetails: {
    account_name: string;
    account_number: string;
    ifsc_code: string;
  } | null;
}

export function BankDetailsDialog({ 
  open, 
  onOpenChange, 
  selectedGroomer, 
  bankDetails 
}: BankDetailsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bank Details - {selectedGroomer?.salon_name}</AlertDialogTitle>
        </AlertDialogHeader>
        {bankDetails ? (
          <div className="space-y-4">
            <div className="border p-3 rounded-md bg-gray-50">
              <p className="mb-2"><span className="font-medium">Account Name:</span> {bankDetails.account_name}</p>
              <p className="mb-2"><span className="font-medium">Account Number:</span> {bankDetails.account_number}</p>
              <p><span className="font-medium">IFSC Code:</span> {bankDetails.ifsc_code}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <p>Account holder: {bankDetails.account_name}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No bank details found for this groomer.</p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
