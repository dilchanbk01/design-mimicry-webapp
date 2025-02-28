
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Clock, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PayoutRequestFormProps {
  eventId: string;
  eventDate: string;
  eventEnded: boolean;
  onClose: () => void;
}

export function PayoutRequestForm({ eventId, eventDate, eventEnded, onClose }: PayoutRequestFormProps) {
  const { toast } = useToast();
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  
  // Bank details form states
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Check if a payout request already exists for this event
  const checkExistingRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('payout_requests')
        .select('status')
        .eq('event_id', eventId)
        .eq('organizer_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking existing request:", error);
        return null;
      }

      if (data) {
        setCurrentStatus(data.status);
        return data.status;
      }
      
      return null;
    } catch (error) {
      console.error("Error in checkExistingRequest:", error);
      return null;
    }
  };

  // Check status on component mount
  useState(() => {
    checkExistingRequest();
  });

  const handlePayoutRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // First check if a request already exists
    const existingStatus = await checkExistingRequest();
    if (existingStatus) {
      setCurrentStatus(existingStatus);
      toast({
        title: "Request already exists",
        description: `Your payout request is currently ${existingStatus}. Please wait for admin approval.`,
      });
      return;
    }
    
    setShowBankDetails(true);
  };

  const handleCancelForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBankDetails(false);
    onClose();
    // Reset form fields
    setAccountName("");
    setAccountNumber("");
    setConfirmAccountNumber("");
    setIfscCode("");
  };

  const validateIFSC = (code: string): boolean => {
    // IFSC code format: 4 characters (bank code) + 0 + 6 characters (branch code)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code);
  };

  const handleSubmitBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

    setIsSubmitting(true);

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

      // Log to help with debugging
      console.log("Submitting payout request:", {
        event_id: eventId,
        organizer_id: user.id,
        account_name: accountName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        status: 'waiting_for_payment'
      });

      // Store bank details with initial status of waiting_for_payment
      const { error } = await supabase.from('payout_requests').insert({
        event_id: eventId,
        organizer_id: user.id,
        account_name: accountName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        status: 'waiting_for_payment'
      });

      if (error) {
        console.error("Supabase error inserting payout request:", error);
        throw error;
      }

      setCurrentStatus('waiting_for_payment');
      
      toast({
        title: "Request Submitted Successfully",
        description: "Your payout request has been sent to the admin team for processing. You will be notified once payment is processed.",
      });

      // Reset form and close
      setAccountName("");
      setAccountNumber("");
      setConfirmAccountNumber("");
      setIfscCode("");
      setShowBankDetails(false);
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast({
        title: "Error",
        description: "Failed to submit payout request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusButton = () => {
    if (!currentStatus) {
      return (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={handlePayoutRequest}
          disabled={!eventEnded}
        >
          Send Payout Request
        </Button>
      );
    }

    switch (currentStatus) {
      case 'waiting_for_payment':
        return (
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white cursor-default"
            disabled
          >
            <Clock className="h-4 w-4 mr-2" />
            Waiting for Payment
          </Button>
        );
      case 'payment_received':
        return (
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-default"
            disabled
          >
            Payment Received
          </Button>
        );
      case 'approved':
        return (
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white cursor-default"
            disabled
          >
            Payout Approved
          </Button>
        );
      case 'rejected':
        return (
          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={handlePayoutRequest}
          >
            Request Rejected - Try Again
          </Button>
        );
      case 'pending':
      default:
        return (
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white cursor-default"
            disabled
          >
            Request Pending
          </Button>
        );
    }
  };
  
  return (
    <div className="px-6 pb-6">
      {!showBankDetails ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative inline-block w-full">
                {getStatusButton()}
                {!eventEnded && !currentStatus && (
                  <div className="flex items-center mt-2 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>Available after event ends</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Payout requests can only be made after the event has ended</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div 
          className="mt-4 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Bank Account Details</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleCancelForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!eventEnded && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
              <p className="font-medium">Important Note:</p>
              <p>Payout requests can only be made after the event has ended.</p>
              <p>This event is scheduled for {format(new Date(eventDate), "PPP")} at {format(new Date(eventDate), "p")}.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmitBankDetails} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`accountName-${eventId}`} className="text-xs">
                Account Holder Name
              </Label>
              <Input
                id={`accountName-${eventId}`}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter name as on passbook"
                className="h-9 text-sm"
                required
                disabled={!eventEnded || isSubmitting}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`accountNumber-${eventId}`} className="text-xs">
                Account Number
              </Label>
              <Input
                id={`accountNumber-${eventId}`}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter account number"
                className="h-9 text-sm"
                type="text"
                inputMode="numeric"
                required
                disabled={!eventEnded || isSubmitting}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`confirmAccountNumber-${eventId}`} className="text-xs">
                Verify Account Number
              </Label>
              <Input
                id={`confirmAccountNumber-${eventId}`}
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter account number"
                className="h-9 text-sm"
                type="text"
                inputMode="numeric"
                required
                disabled={!eventEnded || isSubmitting}
              />
              {accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber && (
                <p className="text-xs text-red-500">Account numbers don't match</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`ifscCode-${eventId}`} className="text-xs">
                IFSC Code
              </Label>
              <Input
                id={`ifscCode-${eventId}`}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g., SBIN0123456"
                className="h-9 text-sm"
                maxLength={11}
                required
                disabled={!eventEnded || isSubmitting}
              />
              <p className="text-xs text-gray-500">
                4 chars (bank) + 0 + 6 chars (branch)
              </p>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9 text-sm"
                onClick={handleCancelForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-9 text-sm bg-green-600 hover:bg-green-700"
                disabled={!eventEnded || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
