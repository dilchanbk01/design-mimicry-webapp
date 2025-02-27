
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GroomingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  groomer_id: string;
  created_at: string;
}

interface GroomerPackagesProps {
  packages: GroomingPackage[];
  selectedPackage: GroomingPackage | null;
  onSelectPackage: (pkg: GroomingPackage | null) => void;
  groomerPrice: number;
  isProcessing: boolean;
}

export function GroomerPackages({ 
  packages, 
  selectedPackage, 
  onSelectPackage, 
  groomerPrice,
  isProcessing 
}: GroomerPackagesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-green-800">Grooming Packages</h2>
      {packages.length === 0 ? (
        <p className="text-gray-500 italic">No packages available</p>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`border rounded-xl ${selectedPackage?.id === pkg.id ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-medium">{pkg.name}</h3>
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent side="top" align="start" className="w-[280px] bg-white z-50">
                          <div className="space-y-2">
                            <h4 className="font-medium">{pkg.name}</h4>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="text-green-600 font-semibold mt-1">₹{pkg.price}</p>
                  </div>
                  <Button 
                    variant={selectedPackage?.id === pkg.id ? "default" : "outline"} 
                    size="sm"
                    className={selectedPackage?.id === pkg.id ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
                    onClick={() => onSelectPackage(pkg)}
                    disabled={isProcessing}
                  >
                    {selectedPackage?.id === pkg.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Standard service card */}
      <Card className={`mt-3 border rounded-xl ${!selectedPackage ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-500 transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-md font-medium">Standard Grooming</h3>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Basic</Badge>
                <Popover>
                  <PopoverTrigger>
                    <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
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
              <p className="text-green-600 font-semibold mt-1">₹{groomerPrice}</p>
            </div>
            <Button 
              variant={!selectedPackage ? "default" : "outline"} 
              size="sm"
              className={!selectedPackage ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600 hover:bg-green-50"}
              onClick={() => onSelectPackage(null)}
              disabled={isProcessing}
            >
              {!selectedPackage ? "Selected" : "Select"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
