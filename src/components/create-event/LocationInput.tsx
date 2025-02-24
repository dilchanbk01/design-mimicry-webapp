
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationInputProps {
  location: string;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationInput({ location, onLocationChange }: LocationInputProps) {
  return (
    <div className="relative">
      <Label>Location</Label>
      <Input
        id="location-input"
        placeholder="Start typing to search..."
        required
        value={location}
        onChange={onLocationChange}
        className="mt-1"
      />
    </div>
  );
}
