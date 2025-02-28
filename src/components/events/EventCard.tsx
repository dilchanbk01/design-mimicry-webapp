
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Event } from "@/types/events";
import { EventCardHeader } from "./EventCardHeader";
import { EventCardDetails } from "./EventCardDetails";
import { EventCardAnalytics } from "./EventCardAnalytics";
import { EventCardBookingButton } from "./EventCardBookingButton";
import { PayoutRequestForm } from "./PayoutRequestForm";

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
  const [eventEnded, setEventEnded] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

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

  return (
    <div
      className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 ${
        isOrganizer ? "" : "cursor-pointer hover:shadow-xl"
      } ${
        !isOrganizer && !showBankDetails ? "hover:-translate-y-1" : ""
      }`}
      onClick={handleCardClick}
    >
      <EventCardHeader imageUrl={event.image_url} title={event.title} />
      <EventCardDetails 
        date={event.date} 
        location={event.location} 
        price={event.price} 
      />
      
      {isOrganizer && analytics && (
        <EventCardAnalytics 
          ticketsSold={analytics.ticketsSold} 
          totalAmount={analytics.totalAmount} 
        />
      )}

      {isOrganizer ? (
        <PayoutRequestForm 
          eventId={event.id} 
          eventDate={event.date} 
          eventEnded={eventEnded}
          onClose={() => setShowBankDetails(false)}
        />
      ) : (
        <EventCardBookingButton isBooked={isBooked} />
      )}
    </div>
  );
}
