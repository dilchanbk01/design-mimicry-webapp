
import { MapPin, Scissors, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroomingPartner } from "../types";

interface GroomerCardProps {
  partner: GroomingPartner;
  onViewDetails: () => void;
}

export function GroomerCard({ partner, onViewDetails }: GroomerCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onViewDetails}
    >
      <div className="relative h-44">
        <img
          src={partner.image}
          alt={partner.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        {/* Name moved above location */}
        <h3 className="text-xl font-bold mb-2">{partner.name}</h3>
        
        <div className="flex items-start mb-3">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="ml-2 text-sm text-gray-600 line-clamp-1">{partner.location}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {partner.providesSalonService && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Scissors className="w-3 h-3 mr-1" />
              Salon Service
            </div>
          )}
          {partner.providesHomeService && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Home className="w-3 h-3 mr-1" />
              Home Visit
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{partner.experience}</p>
            <p className="text-sm font-semibold text-green-700">{partner.price}</p>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card click
              onViewDetails();
            }}
            className="bg-[#00D26A] hover:bg-[#00B05A] text-white px-6 py-6 text-base"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
