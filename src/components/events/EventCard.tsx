
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Event } from "@/types/events";
import { getOptimizedImageUrl } from "@/utils/imageCompression";
import { BankDetailsDialog } from "@/components/events/BankDetailsDialog";
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [eventEnded, setEventEnded] = useState(false);

  useEffect(() => {
    // Check if event has ended
    const eventDate = new Date(event.date);
    const now = new Date();
    setEventEnded(eventDate < now);
  }, [event.date]);

  const handlePayoutRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBankDetails(true);
  };

  const handleBankDetailsSubmitted = () => {
    // This will be called after successful submission
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => navigate(`/events/${event.id}`)}
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

      {/* Bank Details Dialog */}
      <BankDetailsDialog 
        isOpen={showBankDetails}
        onClose={() => setShowBankDetails(false)}
        onSubmit={handleBankDetailsSubmitted}
        eventId={event.id}
      />
    </div>
  );
}
