
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Event } from "@/types/events";
import { getOptimizedImageUrl } from "@/utils/imageCompression";

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

  return (
    <div
      className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <img
        src={getOptimizedImageUrl(event.image_url, 800)}
        alt={event.title}
        className="w-full h-48 object-cover"
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
          <Button
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle payout request logic here
              alert("Payout request sent. We'll process it within 7 business days.");
            }}
          >
            Send Payout Request
          </Button>
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
