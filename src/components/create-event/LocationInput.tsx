
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LocationInputProps {
  location: string;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationInput({ location, onLocationChange, onLocationSelect }: LocationInputProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
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
    <div className="space-y-2">
      <Label>Location</Label>
      <div className="relative">
        <Input
          id="location-input"
          placeholder="Start typing to search..."
          required
          value={location}
          onChange={onLocationChange}
          className="pr-24"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-1 top-1 h-8"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
        >
          <MapPin className="h-4 w-4 mr-1" />
          {isLoadingLocation ? "Loading..." : "Current"}
        </Button>
      </div>
    </div>
  );
}
