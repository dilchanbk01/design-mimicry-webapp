
import { Input } from "@/components/ui/input";

interface LocationSectionProps {
  location: string;
  onChange: (field: string, value: string) => void;
}

export function LocationSection({ location, onChange }: LocationSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Location</h2>
      <Input
        placeholder="Event Location"
        required
        value={location}
        onChange={(e) => onChange("location", e.target.value)}
      />
    </div>
  );
}
