
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BankDetails, BankDetailsForm } from "./payout/BankDetailsForm";
import { PayoutStatusButton } from "./payout/PayoutStatusButton";

interface PayoutRequestFormProps {
  eventId: string;
  eventDate: string;
  eventEnded: boolean;
  onClose: () => void;
}

export function PayoutRequestForm({ eventId, eventDate, eventEnded, onClose }: PayoutRequestFormProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountName: "",
    accountNumber: "",
    ifscCode: ""
  });
  const [showBankForm, setShowBankForm] = useState(false);
  
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
  useEffect(() => {
    checkExistingRequest();
  }, [eventId]);

  const validateBankDetails = (): boolean => {
    if (!bankDetails.accountName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter account holder name",
        variant: "destructive",
      });
      return false;
    }
    if (!bankDetails.accountNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter account number",
        variant: "destructive",
      });
      return false;
    }
    if (!bankDetails.ifscCode.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter IFSC code",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmitRequest = async (e: React.MouseEvent) => {
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
    
    // First check if a request already exists
    const existingStatus = await checkExistingRequest();
    if (existingStatus) {
      setCurrentStatus(existingStatus);
      toast({
        title: "Request already exists",
        description: `Your payout request is currently ${existingStatus}. Please wait for admin review.`,
        variant: "destructive"
      });
      return;
    }

    // If we don't have bank details yet, show the form instead of submitting
    if (!showBankForm) {
      setShowBankForm(true);
      return;
    }

    // Validate bank details before submission
    if (!validateBankDetails()) {
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
        setIsSubmitting(false);
        return;
      }

      // Use Supabase RPC call to create a payout request with bank details
      const { data, error } = await supabase.rpc('create_simplified_payout_request', {
        p_event_id: eventId,
        p_organizer_id: user.id,
        p_account_name: bankDetails.accountName,
        p_account_number: bankDetails.accountNumber,
        p_ifsc_code: bankDetails.ifscCode
      });

      if (error) {
        console.error("Supabase error creating payout request:", error);
        throw error;
      }

      setCurrentStatus('waiting_for_review');
      setShowBankForm(false);
      
      // Notify admin (this would be implemented in a Supabase Edge Function)
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            eventId: eventId,
            type: 'payout_request',
            userId: user.id
          }
        });
      } catch (notifyError) {
        console.error("Error notifying admin:", notifyError);
        // Continue with success even if notification fails
      }

      toast({
        title: "Request Submitted Successfully",
        description: "Your payout request has been sent to the admin team. They will review the provided bank details.",
      });

    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit payout request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="px-6 pb-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative inline-block w-full">
              {!showBankForm && (
                <PayoutStatusButton 
                  status={currentStatus}
                  isSubmitting={isSubmitting}
                  eventEnded={eventEnded}
                  onClick={handleSubmitRequest}
                />
              )}
              {!eventEnded && !currentStatus && (
                <div className="flex items-center mt-2 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>Available after event ends</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          {!eventEnded && !currentStatus && (
            <TooltipContent>
              <p>Payout requests can only be made after the event has ended</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {showBankForm && !currentStatus && (
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Enter Bank Details</h3>
          <BankDetailsForm onBankDetailsChange={setBankDetails} />
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowBankForm(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      )}
      
      {currentStatus && (
        <div className="mt-4 text-sm text-gray-600">
          <p className="italic">
            Our admin team will review your request and process the payment using your provided bank details.
          </p>
        </div>
      )}
    </div>
  );
}
