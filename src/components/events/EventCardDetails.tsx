
import { Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

interface EventCardDetailsProps {
  date: string;
  location: string;
  price: number;
}

export function EventCardDetails({ date, location, price }: EventCardDetailsProps) {
  return (
    <div className="space-y-2 text-sm p-6 pt-0">
      <div className="flex items-center text-gray-600">
        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>{format(new Date(date), "PPP")}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>{format(new Date(date), "p")}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="line-clamp-1">{location}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <span className="font-semibold">₹{price}</span>
      </div>
    </div>
  );
}
