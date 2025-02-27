
import type { GroomerProfile } from "../../types";

interface ServiceTypeButtonsProps {
  groomer: GroomerProfile;
  selectedServiceType: 'salon' | 'home';
  onServiceTypeChange: (type: 'salon' | 'home') => void;
}

export function ServiceTypeButtons({ 
  groomer, 
  selectedServiceType, 
  onServiceTypeChange 
}: ServiceTypeButtonsProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Service Type</h3>
      <div className="flex gap-4">
        {groomer.provides_salon_service && (
          <button
            onClick={() => onServiceTypeChange('salon')}
            className={`flex-1 p-4 rounded-lg border ${
              selectedServiceType === 'salon'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-200'
            }`}
          >
            <h4 className="font-medium">Salon Visit</h4>
            <p className="text-sm text-gray-500">Visit the groomer's location</p>
          </button>
        )}
        {groomer.provides_home_service && (
          <button
            onClick={() => onServiceTypeChange('home')}
            className={`flex-1 p-4 rounded-lg border ${
              selectedServiceType === 'home'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-200'
            }`}
          >
            <h4 className="font-medium">Home Visit</h4>
            <p className="text-sm text-gray-500">Groomer visits your location</p>
            <p className="text-sm text-green-600 mt-1">+₹{groomer.home_service_cost || 0}</p>
          </button>
        )}
      </div>
    </div>
  );
}
