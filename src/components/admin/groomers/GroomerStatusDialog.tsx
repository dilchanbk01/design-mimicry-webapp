import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Groomer {
  id: string;
  salon_name: string;
  // other properties
}

interface GroomerStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroomer: Groomer | null;
  newStatus: 'approved' | 'rejected' | null;
  onUpdateStatus: () => void;
}

export function GroomerStatusDialog({
  open,
  onOpenChange,
  selectedGroomer,
  newStatus,
  onUpdateStatus
}: GroomerStatusDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {newStatus === 'approved' ? 'Approve' : 'Reject'} Groomer Application
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {newStatus === 'approved' ? 'approve' : 'reject'} the application from {selectedGroomer?.salon_name}?
            
            {newStatus === 'approved' ? (
              <p className="mt-2">This will allow them to receive bookings on the platform.</p>
            ) : (
              <p className="mt-2">They will need to reapply or contact support if rejected.</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onUpdateStatus();
            }}
            className={newStatus === 'approved' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {newStatus === 'approved' ? 'Approve' : 'Reject'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
