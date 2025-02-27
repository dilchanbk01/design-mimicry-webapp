
interface PetDetailsInputProps {
  petDetails: string;
  onPetDetailsChange: (details: string) => void;
}

export function PetDetailsInput({ petDetails, onPetDetailsChange }: PetDetailsInputProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pet Details</h3>
      <textarea
        value={petDetails}
        onChange={(e) => onPetDetailsChange(e.target.value)}
        placeholder="Tell us about your pet (type, breed, age, etc.)"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        rows={4}
      />
    </div>
  );
}
