
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp, AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Event } from "@/types/events";
import { getOptimizedImageUrl } from "@/utils/imageCompression";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventCardProps {
  event: Event;
  isBooked: boolean;
  isOrganizer?: boolean;
  analytics?: {
    ticketsSold: number;
    totalAmount: number;
  };
}

export function EventCard({ event, isBooked, isOrganizer, analytics }: EventCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [eventEnded, setEventEnded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bank details form states
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  useEffect(() => {
    // Check if event has ended - using event date as end date
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Event is considered ended if current time is past event start time
    setEventEnded(now > eventDate);
  }, [event.date]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not organizer view and not showing bank details
    if (!isOrganizer && !showBankDetails) {
      navigate(`/events/${event.id}`);
    }
  };

  const handlePayoutRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBankDetails(true);
  };

  const handleCancelForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBankDetails(false);
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

      // Store bank details
      const { error } = await supabase.from('payout_requests').insert({
        event_id: event.id,
        organizer_id: user.id,
        account_name: accountName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully",
        description: "Your payout request has been sent to the admin team for processing. You will be notified once it's approved.",
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

  return (
    <div
      className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 ${
        isOrganizer ? "" : "cursor-pointer hover:shadow-xl"
      } ${
        !isOrganizer && !showBankDetails ? "hover:-translate-y-1" : ""
      }`}
      onClick={handleCardClick}
    >
      <img
        src={getOptimizedImageUrl(event.image_url, 800)}
        alt={event.title}
        className="w-full h-48 object-cover"
        width="800"
        height="192"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 line-clamp-1">
          {event.title}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(event.date), "PPP")}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(event.date), "p")}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="font-semibold">₹{event.price}</span>
          </div>
        </div>

        {isOrganizer && analytics && (
          <div className="mt-4">
            <Button
              variant="ghost"
              className="w-full justify-between text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAnalytics(!showAnalytics);
              }}
            >
              Event Analytics
              {showAnalytics ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showAnalytics && (
              <div 
                className="mt-2 p-4 bg-gray-50 rounded-lg space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tickets Sold:</span>
                  <span className="font-semibold">{analytics.ticketsSold}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue:</span>
                  <span className="font-semibold text-green-600">₹{analytics.totalAmount}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isOrganizer ? (
          <div className="mt-6">
            {!showBankDetails ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative inline-block w-full">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handlePayoutRequest}
                        disabled={!eventEnded}
                      >
                        Send Payout Request
                      </Button>
                      {!eventEnded && (
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
                    <p>This event is scheduled for {format(new Date(event.date), "PPP")} at {format(new Date(event.date), "p")}.</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmitBankDetails} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`accountName-${event.id}`} className="text-xs">
                      Account Holder Name
                    </Label>
                    <Input
                      id={`accountName-${event.id}`}
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Enter name as on passbook"
                      className="h-9 text-sm"
                      required
                      disabled={!eventEnded || isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`accountNumber-${event.id}`} className="text-xs">
                      Account Number
                    </Label>
                    <Input
                      id={`accountNumber-${event.id}`}
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
                    <Label htmlFor={`confirmAccountNumber-${event.id}`} className="text-xs">
                      Verify Account Number
                    </Label>
                    <Input
                      id={`confirmAccountNumber-${event.id}`}
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
                    <Label htmlFor={`ifscCode-${event.id}`} className="text-xs">
                      IFSC Code
                    </Label>
                    <Input
                      id={`ifscCode-${event.id}`}
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
        ) : (
          <Button
            className={`w-full mt-6 ${
              isBooked
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-900 hover:bg-blue-800"
            } text-white`}
            disabled={isBooked}
          >
            {isBooked ? "Booked" : "Book Now"}
          </Button>
        )}
      </div>
    </div>
  );
}
