
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { GroomingPackage } from "../types/packages";

interface GroomerPackagesProps {
  packages: GroomingPackage[];
  selectedPackage?: GroomingPackage | null;
  onSelectPackage?: (pkg: GroomingPackage | null) => void;
  groomerPrice?: number;
  isProcessing?: boolean;
}

export function GroomerPackages({ 
  packages, 
  selectedPackage = null, 
  onSelectPackage = () => {}, 
  groomerPrice = 0,
  isProcessing = false
}: GroomerPackagesProps) {
  if (packages.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3 text-green-800">Grooming Packages</h2>
        <p className="text-gray-500 italic text-sm">No packages available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-green-800">Grooming Packages</h2>
      <div className="space-y-2">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`border rounded-xl ${selectedPackage?.id === pkg.id ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{pkg.name}</h3>
                    <Popover>
                      <PopoverTrigger>
                        <Info className="h-3 w-3 text-gray-400 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-[280px] bg-white z-50">
                        <div className="space-y-2">
                          <h4 className="font-medium">{pkg.name}</h4>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-green-600 font-semibold mt-1 text-xs">₹{pkg.price}</p>
                </div>
                {onSelectPackage && (
                  <Button 
                    variant={selectedPackage?.id === pkg.id ? "default" : "outline"} 
                    size="sm"
                    className={`text-xs py-1 px-2 h-auto ${selectedPackage?.id === pkg.id ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}`}
                    onClick={() => onSelectPackage(pkg)}
                    disabled={isProcessing}
                  >
                    {selectedPackage?.id === pkg.id ? "Selected" : "Select"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {groomerPrice > 0 && onSelectPackage && (
          <Card className={`mt-2 border rounded-xl ${!selectedPackage ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Standard Grooming</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs py-0 px-1 h-4">Basic</Badge>
                    <Popover>
                      <PopoverTrigger>
                        <Info className="h-3 w-3 text-gray-400 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-[280px] bg-white z-50">
                        <div className="space-y-2">
                          <h4 className="font-medium">Standard Grooming</h4>
                          <p className="text-sm text-gray-600">
                            Basic grooming service includes bath, brushing, nail trimming, ear cleaning, and a basic haircut.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-green-600 font-semibold mt-1 text-xs">₹{groomerPrice}</p>
                </div>
                <Button 
                  variant={!selectedPackage ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs py-1 px-2 h-auto ${!selectedPackage ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}`}
                  onClick={() => onSelectPackage(null)}
                  disabled={isProcessing}
                >
                  {!selectedPackage ? "Selected" : "Select"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
