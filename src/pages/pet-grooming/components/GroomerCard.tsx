
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Home, Store } from "lucide-react";
import { GroomingPartner } from "../types";
import { getOptimizedImageUrl } from "@/utils/imageCompression";

interface GroomerCardProps {
  partner: GroomingPartner;
  onBooking: (partner: GroomingPartner) => void;
  onViewDetails: () => void;
}

export function GroomerCard({ partner, onBooking, onViewDetails }: GroomerCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img
            src={getOptimizedImageUrl(partner.image, 600)}
            alt={partner.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs font-medium">{partner.rating}</span>
          </div>
        </div>
        <div className="p-4 md:p-6 md:w-2/3 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div>
              <h2 className="text-lg font-semibold">{partner.name}</h2>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate">{partner.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center text-gray-600">
                <Scissors className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs">{partner.experience}</span>
              </div>
              <div className="flex gap-2">
                {partner.providesSalonService && (
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Store className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-xs">Salon</span>
                  </div>
                )}
                {partner.providesHomeService && (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <Home className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-xs">Home</span>
                  </div>
                )}
              </div>
              <div className="text-xs font-medium text-primary">
                {partner.price}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button 
              className="flex-1 py-1 px-2 h-auto text-xs"
              onClick={() => onBooking(partner)}
            >
              Book Now
            </Button>
            <Button 
              variant="outline"
              className="flex-1 py-1 px-2 h-auto text-xs"
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
