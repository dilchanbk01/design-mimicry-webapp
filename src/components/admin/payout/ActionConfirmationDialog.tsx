
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { PayoutRequest } from "./types";

interface ActionConfirmationDialogProps {
  actionType: string;
  request: PayoutRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ActionConfirmationDialog({
  actionType,
  request,
  open,
  onOpenChange,
  onConfirm
}: ActionConfirmationDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionType === "reject" && "Reject Payout Request"}
          </DialogTitle>
          <DialogDescription>
            {actionType === "reject" && "Reject the payout request. The organizer will be able to submit a new request."}
          </DialogDescription>
        </DialogHeader>

        {request && (
          <div className="py-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{request.event_title}</p>
              <p className="text-sm text-gray-600">Organizer: {request.organizer_name}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            <Ban className="h-4 w-4 mr-1" /> Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
