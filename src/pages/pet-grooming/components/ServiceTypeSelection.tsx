
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Store, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ServiceOption } from "../types/packages";

interface ServiceTypeSelectionProps {
  selectedType: 'salon' | 'home';
  onChange: (type: 'salon' | 'home') => void;
  homeAddress?: string;
  onHomeAddressChange?: (address: string) => void;
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
  homeAddress = '',
  onHomeAddressChange = () => {},
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
      <h2 className="text-lg font-semibold mb-3 text-green-800">Service Type</h2>
      <div className="space-y-3">
        {groomerProvidesSalon && (
          <Card 
            className={`border rounded-xl cursor-pointer ${options.salon.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
            onClick={() => !isProcessing && onChange('salon')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-green-600" />
                    <h3 className="text-md font-medium">At Salon</h3>
                    <Popover>
                      <PopoverTrigger>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-[280px] bg-white z-50">
                        <div className="space-y-2">
                          <h4 className="font-medium">Salon Service</h4>
                          <p className="text-sm text-gray-600">
                            Visit the groomer's salon for the grooming service.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-green-600 font-semibold mt-1">Standard Price</p>
                </div>
                <Button 
                  variant={options.salon.selected ? "default" : "outline"} 
                  size="sm"
                  className={options.salon.selected ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isProcessing) onChange('salon');
                  }}
                  disabled={isProcessing}
                >
                  {options.salon.selected ? "Selected" : "Select"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {groomerProvidesHome && (
          <Card 
            className={`border rounded-xl cursor-pointer ${options.home.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
            onClick={() => !isProcessing && onChange('home')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-green-600" />
                    <h3 className="text-md font-medium">Home Visit</h3>
                    <Popover>
                      <PopoverTrigger>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-[280px] bg-white z-50">
                        <div className="space-y-2">
                          <h4 className="font-medium">Home Service</h4>
                          <p className="text-sm text-gray-600">
                            The groomer will visit your home to provide the grooming service.
                          </p>
                          {options.home.additionalCost > 0 && (
                            <p className="text-sm text-orange-600 font-medium">
                              Additional charge: ₹{options.home.additionalCost}
                            </p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-green-600 font-semibold">
                      {options.home.additionalCost > 0 ? `+₹${options.home.additionalCost}` : 'No additional cost'}
                    </p>
                    {options.home.additionalCost > 0 && (
                      <span className="text-xs text-gray-500 ml-2">for travel expenses</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant={options.home.selected ? "default" : "outline"} 
                  size="sm"
                  className={options.home.selected ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isProcessing) onChange('home');
                  }}
                  disabled={isProcessing}
                >
                  {options.home.selected ? "Selected" : "Select"}
                </Button>
              </div>

              {options.home.selected && (
                <div className="mt-4 pt-4 border-t border-gray-200" onClick={e => e.stopPropagation()}>
                  <Label htmlFor="homeAddress" className="text-sm font-medium text-gray-700">Your Address</Label>
                  <Textarea
                    id="homeAddress"
                    placeholder="Enter your complete address for the home service"
                    value={homeAddress}
                    onChange={(e) => onHomeAddressChange(e.target.value)}
                    className="mt-1"
                    disabled={isProcessing}
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
