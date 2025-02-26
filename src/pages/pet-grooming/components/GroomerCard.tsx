
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Home, Store } from "lucide-react";
import { GroomingPartner } from "../types";

interface GroomerCardProps {
  partner: GroomingPartner;
  onBooking: (partner: GroomingPartner) => void;
  onViewDetails: () => void;
}

export function GroomerCard({ partner, onBooking, onViewDetails }: GroomerCardProps) {
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
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-gray-600">
                <Scissors className="h-4 w-4 mr-1" />
                <span className="text-sm">{partner.experience}</span>
              </div>
              <div className="flex gap-2">
                {partner.providesSalonService && (
                  <div className="flex items-center text-green-600">
                    <Store className="h-4 w-4 mr-1" />
                    <span className="text-sm">Salon</span>
                  </div>
                )}
                {partner.providesHomeService && (
                  <div className="flex items-center text-blue-600">
                    <Home className="h-4 w-4 mr-1" />
                    <span className="text-sm">Home</span>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-primary">
                {partner.price}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button 
              className="flex-1"
              onClick={() => onBooking(partner)}
            >
              Book Appointment
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
