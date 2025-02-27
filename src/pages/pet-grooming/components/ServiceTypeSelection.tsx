
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Store, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceOption } from "../types/packages";

interface ServiceTypeSelectionProps {
  groomerProvidesSalon: boolean;
  groomerProvidesHome: boolean;
  serviceOptions: {
    salon: ServiceOption;
    home: ServiceOption;
  };
  onSelectServiceType: (type: 'salon' | 'home') => void;
  homeAddress: string;
  onHomeAddressChange: (address: string) => void;
  isProcessing: boolean;
}

export function ServiceTypeSelection({
  groomerProvidesSalon,
  groomerProvidesHome,
  serviceOptions,
  onSelectServiceType,
  homeAddress,
  onHomeAddressChange,
  isProcessing
}: ServiceTypeSelectionProps) {
  if (!groomerProvidesSalon && !groomerProvidesHome) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-green-800">Service Type</h2>
      <div className="space-y-3">
        {groomerProvidesSalon && (
          <Card 
            className={`border rounded-xl ${serviceOptions.salon.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
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
                  variant={serviceOptions.salon.selected ? "default" : "outline"} 
                  size="sm"
                  className={serviceOptions.salon.selected ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                  onClick={() => onSelectServiceType('salon')}
                  disabled={isProcessing}
                >
                  {serviceOptions.salon.selected ? "Selected" : "Select"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {groomerProvidesHome && (
          <Card 
            className={`border rounded-xl ${serviceOptions.home.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
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
                          {serviceOptions.home.additionalCost > 0 && (
                            <p className="text-sm text-orange-600 font-medium">
                              Additional charge: ₹{serviceOptions.home.additionalCost}
                            </p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-green-600 font-semibold">
                      {serviceOptions.home.additionalCost > 0 ? `+₹${serviceOptions.home.additionalCost}` : 'No additional cost'}
                    </p>
                    {serviceOptions.home.additionalCost > 0 && (
                      <span className="text-xs text-gray-500 ml-2">for travel expenses</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant={serviceOptions.home.selected ? "default" : "outline"} 
                  size="sm"
                  className={serviceOptions.home.selected ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                  onClick={() => onSelectServiceType('home')}
                  disabled={isProcessing}
                >
                  {serviceOptions.home.selected ? "Selected" : "Select"}
                </Button>
              </div>

              {serviceOptions.home.selected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
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
