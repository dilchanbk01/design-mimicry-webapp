
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

interface CitySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citySearch: string;
  onCitySearchChange: (search: string) => void;
  onCitySelect: (city: string) => void;
}

const CITIES = [
  { name: "Delhi", icon: <MapPin className="h-6 w-6" /> },
  { name: "Mumbai", icon: <MapPin className="h-6 w-6" /> },
  { name: "Bangalore", icon: <MapPin className="h-6 w-6" /> },
  { name: "Hyderabad", icon: <MapPin className="h-6 w-6" /> },
  { name: "Pune", icon: <MapPin className="h-6 w-6" /> },
  { name: "Chennai", icon: <MapPin className="h-6 w-6" /> },
];

export function CitySelectionDialog({
  open,
  onOpenChange,
  citySearch,
  onCitySearchChange,
  onCitySelect,
}: CitySelectionDialogProps) {
  const filteredCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Your City</DialogTitle>
          <DialogDescription>
            Choose your city to see relevant events and services near you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for your city..."
              value={citySearch}
              onChange={(e) => onCitySearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredCities.map((city) => (
              <Button
                key={city.name}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => onCitySelect(city.name)}
              >
                {city.icon}
                {city.name}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
