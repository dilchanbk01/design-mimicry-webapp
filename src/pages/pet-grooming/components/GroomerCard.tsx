
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors } from "lucide-react";
import { GroomingPartner } from "../types";

interface GroomerCardProps {
  partner: GroomingPartner;
  onBooking: (partner: GroomingPartner) => void;
}

export function GroomerCard({ partner, onBooking }: GroomerCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 md:h-auto">
          <img
            src={partner.image}
            alt={partner.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:w-2/3 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{partner.name}</h2>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{partner.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{partner.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-gray-600">
                <Scissors className="h-4 w-4 mr-1" />
                <span className="text-sm">{partner.experience}</span>
              </div>
              <div className="text-sm font-medium text-primary">
                {partner.price}
              </div>
            </div>
          </div>
          <Button 
            className="mt-4 w-full md:w-auto"
            onClick={() => onBooking(partner)}
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
