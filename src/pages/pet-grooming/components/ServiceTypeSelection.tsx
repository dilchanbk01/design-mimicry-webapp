
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Store, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { ServiceOption } from "../types/packages";

interface ServiceTypeSelectionProps {
  selectedType: 'salon' | 'home';
  onChange: (type: 'salon' | 'home') => void;
  isProcessing?: boolean;
  groomerProvidesSalon?: boolean; 
  groomerProvidesHome?: boolean;
  serviceOptions?: {
    salon: ServiceOption;
    home: ServiceOption;
  };
}

export function ServiceTypeSelection({
  selectedType,
  onChange,
  isProcessing = false,
  groomerProvidesSalon = true,
  groomerProvidesHome = true,
  serviceOptions
}: ServiceTypeSelectionProps) {
  // Create default service options if not provided
  const options = serviceOptions || {
    salon: { type: 'salon', additionalCost: 0, selected: selectedType === 'salon' },
    home: { type: 'home', additionalCost: 100, selected: selectedType === 'home' }
  };

  if (!groomerProvidesSalon && !groomerProvidesHome) {
    return null;
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-2 text-green-800">Service Type</h2>
      <div className="flex gap-2">
        {groomerProvidesSalon && (
          <Card 
            className={`border rounded-lg cursor-pointer flex-1 ${options.salon.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
            onClick={() => !isProcessing && onChange('salon')}
          >
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Store className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium">Salon</span>
              </div>
              {options.salon.selected && (
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              )}
            </CardContent>
          </Card>
        )}

        {groomerProvidesHome && (
          <Card 
            className={`border rounded-lg cursor-pointer flex-1 ${options.home.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
            onClick={() => !isProcessing && onChange('home')}
          >
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Home className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium">Home Visit</span>
                {options.home.additionalCost > 0 && (
                  <span className="text-xs text-green-600 font-medium ml-1">
                    +₹{options.home.additionalCost}
                  </span>
                )}
              </div>
              {options.home.selected && (
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
