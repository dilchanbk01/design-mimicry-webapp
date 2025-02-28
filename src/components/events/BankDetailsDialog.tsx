
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BankDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  eventId: string;
}

export function BankDetailsDialog({ isOpen, onClose, onSubmit, eventId }: BankDetailsDialogProps) {
  const { toast } = useToast();
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventEnded, setEventEnded] = useState(true);
  const [eventDate, setEventDate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && eventId) {
      checkEventStatus();
    }
  }, [isOpen, eventId]);

  const checkEventStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('date')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        const eventTime = new Date(data.date);
        const now = new Date();
        setEventDate(format(eventTime, "PPP"));
        setEventEnded(eventTime < now);
      }
    } catch (error) {
      console.error("Error checking event status:", error);
    }
  };

  const validateIFSC = (code: string): boolean => {
    // IFSC code format: 4 characters (bank code) + 0 + 6 characters (branch code)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventEnded) {
      toast({
        title: "Event not ended",
        description: "Payout requests can only be made after the event has ended.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate all fields are filled
    if (!accountName || !accountNumber || !confirmAccountNumber || !ifscCode) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate account numbers match
    if (accountNumber !== confirmAccountNumber) {
      toast({
        title: "Account numbers don't match",
        description: "Please verify the account number",
        variant: "destructive",
      });
      return;
    }

    // Validate IFSC code format
    if (!validateIFSC(ifscCode)) {
      toast({
        title: "Invalid IFSC code",
        description: "Please enter a valid IFSC code (e.g., SBIN0123456)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      // Store bank details
      const { error } = await supabase.from('payout_requests').insert({
        event_id: eventId,
        organizer_id: user.id,
        account_name: accountName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Details submitted",
        description: "Payout request sent successfully. We'll process it within 7 business days.",
      });

      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast({
        title: "Error",
        description: "Failed to submit payout request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bank Account Details</DialogTitle>
          <DialogDescription>
            Enter your bank details to process the payout request
          </DialogDescription>
        </DialogHeader>

        {!eventEnded && eventDate && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
            <p className="font-medium">Important Note:</p>
            <p>Payout requests can only be made after the event has ended.</p>
            <p>This event is scheduled for {eventDate}.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Holder Name (as per passbook)</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter name as on passbook"
              required
              disabled={!eventEnded}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter account number"
              type="text"
              inputMode="numeric"
              required
              disabled={!eventEnded}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmAccountNumber">Verify Account Number</Label>
            <Input
              id="confirmAccountNumber"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Re-enter account number"
              type="text"
              inputMode="numeric"
              required
              disabled={!eventEnded}
            />
            {accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber && (
              <p className="text-xs text-red-500">Account numbers don't match</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="e.g., SBIN0123456"
              required
              maxLength={11}
              disabled={!eventEnded}
            />
            <p className="text-xs text-gray-500">
              IFSC code format: 4 characters (bank code) + 0 + 6 characters (branch code)
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !eventEnded}>
              {isLoading ? "Processing..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
