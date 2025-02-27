
import { Home, Store } from "lucide-react";

interface GroomerServicesProps {
  providesSalonService: boolean;
  providesHomeService: boolean;
}

export function GroomerServices({ providesSalonService, providesHomeService }: GroomerServicesProps) {
  return (
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
        </div>
      )}
    </div>
  );
}
