
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMjSsICfQQn0ubanKa1kxr9S9Exo4xRrQ";

interface LocationInputProps {
  location: string;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationInput({ location, onLocationChange }: LocationInputProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();
  const autocompleteInitialized = useRef(false);

  useEffect(() => {
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement("script");
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initAutocomplete();
      };
      document.head.appendChild(script);
    } else if (window.google && !autocompleteInitialized.current) {
      initAutocomplete();
    }

    return () => {
      autocompleteInitialized.current = false;
    };
  }, []);

  const initAutocomplete = () => {
    if (!window.google || autocompleteInitialized.current) return;
    
    const input = document.getElementById("location-input") as HTMLInputElement;
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        fields: ['formatted_address', 'geometry'],
        componentRestrictions: { country: 'in' }
      });

      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const pacContainer = document.querySelector('.pac-container') as HTMLElement;
        
        if (pacContainer) {
          pacContainer.style.display = target.value.length >= 4 ? 'block' : 'none';
        }
      });
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          const event = {
            target: {
              value: place.formatted_address
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onLocationChange(event);
        }
      });
      
      autocompleteInitialized.current = true;
    }
  };

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

      <style>{`
        .pac-container {
          z-index: 9999 !important;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-top: 4px;
          font-family: inherit;
          display: none;
        }
        .pac-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
        }
        .pac-item:hover {
          background-color: #f3f4f6;
        }
        .pac-item-query {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
