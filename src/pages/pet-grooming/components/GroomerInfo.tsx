
import { MapPin, Scissors, Phone } from "lucide-react";

interface GroomerInfoProps {
  address: string;
  contactNumber: string;
  experienceYears?: number;
}

export function GroomerInfo({ address, contactNumber, experienceYears }: GroomerInfoProps) {
  return (
    <div className="border-t border-green-100 pt-6">
      <div className="flex flex-col gap-4">
        {experienceYears && (
          <div className="flex items-center text-gray-600">
            <Scissors className="h-5 w-5 mr-2 flex-shrink-0 text-green-600" />
            <span className="text-sm">{experienceYears}+ years experience</span>
          </div>
        )}
        <div className="flex items-start text-gray-600">
          <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">Address</h3>
            <p className="text-sm">{address}</p>
          </div>
        </div>
        <div className="flex items-start text-gray-600">
          <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">Contact</h3>
            <p className="text-sm">{contactNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
