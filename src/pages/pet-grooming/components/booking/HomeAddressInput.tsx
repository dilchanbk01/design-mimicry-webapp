
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface HomeAddressInputProps {
  homeAddress: string;
  onHomeAddressChange: (address: string) => void;
}

export function HomeAddressInput({ homeAddress, onHomeAddressChange }: HomeAddressInputProps) {
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // When component mounts, try to parse existing address if any
  useEffect(() => {
    if (homeAddress) {
      const parts = homeAddress.split(', ');
      if (parts.length >= 1) setStreetAddress(parts[0]);
      if (parts.length >= 2) setCity(parts[1]);
      if (parts.length >= 3) setPhoneNumber(parts[2]);
    }
  }, []);

  // Update combined address whenever individual fields change
  useEffect(() => {
    const formattedAddress = [
      streetAddress,
      city,
      phoneNumber
    ].filter(Boolean).join(', ');
    
    onHomeAddressChange(formattedAddress);
  }, [streetAddress, city, phoneNumber, onHomeAddressChange]);

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Home Address</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="street-address" className="text-sm font-medium">Street Address</Label>
          <Input
            id="street-address"
            value={streetAddress}
            placeholder="House/Flat No., Building Name, Street"
            onChange={(e) => setStreetAddress(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="city" className="text-sm font-medium">City</Label>
          <Input
            id="city"
            value={city}
            placeholder="City"
            onChange={(e) => setCity(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phone-number" className="text-sm font-medium">Phone Number</Label>
          <Input
            id="phone-number"
            value={phoneNumber}
            placeholder="Phone Number for contact"
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
