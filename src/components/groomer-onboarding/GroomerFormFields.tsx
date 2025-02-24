
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GroomerFormData } from "./schema";
import { SpecializationsSelect } from "./SpecializationsSelect";

interface GroomerFormFieldsProps {
  formData: GroomerFormData;
  onFormDataChange: (updates: Partial<GroomerFormData>) => void;
  onSpecializationToggle: (specialization: string) => void;
}

export function GroomerFormFields({
  formData,
  onFormDataChange,
  onSpecializationToggle
}: GroomerFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="salonName">Salon Name</Label>
        <Input
          id="salonName"
          value={formData.salonName}
          onChange={(e) => onFormDataChange({ salonName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input
          id="experienceYears"
          type="number"
          min="0"
          value={formData.experienceYears}
          onChange={(e) => onFormDataChange({ experienceYears: e.target.value })}
          required
        />
      </div>

      <SpecializationsSelect
        selectedSpecializations={formData.specializations}
        onToggleSpecialization={onSpecializationToggle}
      />

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onFormDataChange({ address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => onFormDataChange({ contactNumber: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onFormDataChange({ bio: e.target.value })}
          placeholder="Tell us about your grooming experience and services..."
          className="h-32"
        />
      </div>
    </div>
  );
}
