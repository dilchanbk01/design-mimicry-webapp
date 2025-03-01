
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface SpecializationsSelectProps {
  selectedSpecializations: string[];
  onToggleSpecialization: (specialization: string) => void;
  error?: string;
}

export function SpecializationsSelect({ 
  selectedSpecializations, 
  onToggleSpecialization,
  error
}: SpecializationsSelectProps) {
  const specializations = [
    "Dog Grooming",
    "Cat Grooming",
    "Small Animal Grooming",
    "Breed-Specific Styling",
    "Nail Trimming",
    "Ear Cleaning",
    "Teeth Cleaning",
    "Medicated Baths",
    "Flea & Tick Treatments",
    "Dematting",
    "Fur Coloring",
    "Special Occasion Styling"
  ];

  return (
    <div className="space-y-2">
      <div>
        <Label className="block mb-2">Specializations</Label>
        {error && (
          <div className="text-red-500 text-xs flex items-center mb-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </div>
        )}
        <div className={`grid grid-cols-2 gap-2 p-3 border rounded-md ${error ? 'border-red-500' : 'border-gray-200'}`}>
          {specializations.map((specialization) => (
            <div key={specialization} className="flex items-start space-x-2">
              <Checkbox 
                id={specialization.replace(/\s+/g, '-').toLowerCase()}
                checked={selectedSpecializations.includes(specialization)}
                onCheckedChange={() => onToggleSpecialization(specialization)}
                className="mt-0.5"
              />
              <Label 
                htmlFor={specialization.replace(/\s+/g, '-').toLowerCase()}
                className="text-sm font-normal cursor-pointer"
              >
                {specialization}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Select all that apply to your services</p>
      </div>
    </div>
  );
}
