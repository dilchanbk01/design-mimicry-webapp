
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LocationInputProps {
  location: string;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationInput({ location, onLocationChange }: LocationInputProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              const event = {
                target: {
                  value: data.results[0].formatted_address
                }
              } as React.ChangeEvent<HTMLInputElement>;
              onLocationChange(event);
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Could not fetch address from coordinates",
              variant: "destructive",
            });
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Please enable location access in your browser settings",
            variant: "destructive",
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Location</Label>
      <div className="grid gap-4">
        <Input
          placeholder="Street Address (e.g., 123 Main Street, Apartment 4B)"
          value={location}
          onChange={onLocationChange}
          className="w-full"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="City"
            onChange={(e) => {
              const updatedLocation = `${location}, ${e.target.value}`;
              onLocationChange({ target: { value: updatedLocation } } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="w-full"
            required
          />
          <Input
            placeholder="Pincode"
            type="text"
            pattern="[0-9]*"
            maxLength={6}
            onChange={(e) => {
              const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
              const updatedLocation = `${location} - ${pincode}`;
              onLocationChange({ target: { value: updatedLocation } } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="w-full"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
          >
            <MapPin className="h-4 w-4 mr-1" />
            {isLoadingLocation ? "Loading..." : "Use Current Location"}
          </Button>
        </div>
      </div>
    </div>
  );
}
