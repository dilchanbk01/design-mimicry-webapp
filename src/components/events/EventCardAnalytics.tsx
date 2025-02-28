
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EventCardAnalyticsProps {
  ticketsSold: number;
  totalAmount: number;
}

export function EventCardAnalytics({ ticketsSold, totalAmount }: EventCardAnalyticsProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  return (
    <div className="mt-4 px-6">
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
            <span className="font-semibold">{ticketsSold}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Revenue:</span>
            <span className="font-semibold text-green-600">₹{totalAmount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
