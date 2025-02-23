
import { Textarea } from "@/components/ui/textarea";

interface PetSectionProps {
  petTypes: string;
  petRequirements: string;
  petTypeOptions: string[];
  onChange: (field: string, value: string) => void;
}

export function PetSection({
  petTypes,
  petRequirements,
  petTypeOptions,
  onChange,
}: PetSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">
        Pet-Friendly Information
      </h2>
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2"
        value={petTypes}
        onChange={(e) => onChange("petTypes", e.target.value)}
      >
        {petTypeOptions.map((type) => (
          <option key={type} value={type.toLowerCase()}>
            {type}
          </option>
        ))}
      </select>
      <Textarea
        placeholder="Special Pet Requirements (e.g., Vaccination proof, Leash required)"
        value={petRequirements}
        onChange={(e) => onChange("petRequirements", e.target.value)}
      />
    </div>
  );
}
