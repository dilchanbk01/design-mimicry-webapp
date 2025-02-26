
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationInputProps {
  location: string;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationInput({ location, onLocationChange }: LocationInputProps) {
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const updateLocation = (street: string, city: string, pincode: string) => {
    const fullAddress = [
      street,
      city,
      pincode ? pincode : ""
    ].filter(Boolean).join(", ");
    
    onLocationChange({ 
      target: { value: fullAddress } 
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-4">
      <Label>Location</Label>
      <div className="grid gap-4">
        <Input
          placeholder="Street Address (e.g., 123 Main Street, Apartment 4B)"
          value={streetAddress}
          onChange={(e) => {
            setStreetAddress(e.target.value);
            updateLocation(e.target.value, city, pincode);
          }}
          className="w-full"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              updateLocation(streetAddress, e.target.value, pincode);
            }}
            className="w-full"
            required
          />
          <Input
            placeholder="Pincode"
            type="text"
            pattern="[0-9]*"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setPincode(value);
              updateLocation(streetAddress, city, value);
            }}
            className="w-full"
            required
          />
        </div>
      </div>
    </div>
  );
}
