
import { Star, MapPin, Scissors, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroomingPartner } from "../types";

interface GroomerCardProps {
  partner: GroomingPartner;
  onViewDetails: () => void;
}

export function GroomerCard({ partner, onViewDetails }: GroomerCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative h-44">
        <img
          src={partner.image}
          alt={partner.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{partner.name}</h3>
          <div className="flex items-center text-yellow-400 mt-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm">{partner.rating}</span>
            <span className="ml-2 text-xs text-white/80">(120+ reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
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
            <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
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
            onClick={onViewDetails} 
            className="bg-[#8B5CF6] hover:bg-[#7E69AB] text-white px-6 py-5 text-base"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
