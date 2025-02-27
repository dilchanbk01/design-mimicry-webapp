
import { Home, Store } from "lucide-react";

interface GroomerServicesProps {
  providesSalonService: boolean;
  providesHomeService: boolean;
  homeServiceCost?: number;
}

export function GroomerServices({ 
  providesSalonService, 
  providesHomeService, 
  homeServiceCost 
}: GroomerServicesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-green-800">Services</h2>
      <div className="flex flex-wrap gap-3">
        {providesSalonService && (
          <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <Store className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">Salon Service Available</span>
          </div>
        )}
        {providesHomeService && (
          <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <Home className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">Home Service Available</span>
            {homeServiceCost && homeServiceCost > 0 && (
              <span className="ml-1 text-xs text-green-600">(+₹{homeServiceCost})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
