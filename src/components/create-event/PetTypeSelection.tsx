
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PetType {
  id: string;
  label: string;
}

interface PetTypeSelectionProps {
  selectedPets: string[];
  petTypes: PetType[];
  onPetTypeChange: (petId: string) => void;
}

export function PetTypeSelection({ selectedPets, petTypes, onPetTypeChange }: PetTypeSelectionProps) {
  return (
    <div className="space-y-4">
      <Label>Pet Types Welcome</Label>
      <div className="grid grid-cols-2 gap-4">
        {petTypes.map((type) => (
          <div key={type.id} className="flex items-center space-x-2">
            <Checkbox
              id={type.id}
              checked={selectedPets.includes(type.id)}
              onCheckedChange={() => onPetTypeChange(type.id)}
            />
            <Label htmlFor={type.id}>{type.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
