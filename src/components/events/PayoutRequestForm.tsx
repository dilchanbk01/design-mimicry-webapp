
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Clock, CheckCircle, Ban, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

      // Create a simpler payout request without bank details
      const { error } = await supabase.from('payout_requests').insert({
        event_id: eventId,
        organizer_id: user.id,
        status: 'waiting_for_review'
      });

      if (error) {
        console.error("Supabase error inserting payout request:", error);
        throw error;
      }

      setCurrentStatus('waiting_for_review');
      
      // Notify admin via email function (this would be implemented in a Supabase Edge Function)
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
        description: "Your payout request has been sent to the admin team. They will contact you for payment details.",
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

  const renderStatusButton = () => {
    if (!currentStatus) {
      return (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSubmitRequest}
          disabled={!eventEnded || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Request Payout"}
        </Button>
      );
    }

    switch (currentStatus) {
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
            onClick={handleSubmitRequest}
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
  };
  
  return (
    <div className="px-6 pb-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative inline-block w-full">
              {renderStatusButton()}
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
      
      {currentStatus && (
        <div className="mt-4 text-sm text-gray-600">
          <p className="italic">
            Our admin team will contact you via email to arrange your payout.
          </p>
        </div>
      )}
    </div>
  );
}
