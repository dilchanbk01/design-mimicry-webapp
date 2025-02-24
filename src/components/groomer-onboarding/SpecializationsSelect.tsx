
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const SPECIALIZATIONS = [
  "Dog Grooming",
  "Cat Grooming",
  "Pet Spa",
  "Mobile Grooming",
  "Show Grooming",
  "Natural Grooming"
] as const;

interface SpecializationsSelectProps {
  selectedSpecializations: string[];
  onToggleSpecialization: (specialization: string) => void;
}

export function SpecializationsSelect({
  selectedSpecializations,
  onToggleSpecialization
}: SpecializationsSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Specializations</Label>
      <div className="grid grid-cols-2 gap-2">
        {SPECIALIZATIONS.map((specialization) => (
          <Button
            key={specialization}
            type="button"
            variant={selectedSpecializations.includes(specialization) ? "default" : "outline"}
            onClick={() => onToggleSpecialization(specialization)}
            className="justify-start"
          >
            {specialization}
          </Button>
        ))}
      </div>
    </div>
  );
}
