
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { GroomerFormData } from "./schema";
import { SpecializationsSelect } from "./SpecializationsSelect";

interface GroomerFormFieldsProps {
  formData: GroomerFormData;
  onFormDataChange: (updates: Partial<GroomerFormData>) => void;
  onSpecializationToggle: (specialization: string) => void;
  onImageChange: (file: File) => void;
}

export function GroomerFormFields({
  formData,
  onFormDataChange,
  onSpecializationToggle,
  onImageChange
}: GroomerFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profileImage">Profile Image</Label>
        <Input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onImageChange(file);
            }
          }}
          required
        />
      </div>

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
        <Label>Service Types</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onDemand"
              checked={formData.providesHomeService}
              onCheckedChange={(checked) => 
                onFormDataChange({ providesHomeService: checked as boolean })
              }
            />
            <Label htmlFor="onDemand" className="text-sm font-normal">
              Home Service (On-demand grooming at client's location)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="salonService"
              checked={formData.providesSalonService}
              onCheckedChange={(checked) => 
                onFormDataChange({ providesSalonService: checked as boolean })
              }
            />
            <Label htmlFor="salonService" className="text-sm font-normal">
              Salon Service (Appointments at your location)
            </Label>
          </div>
        </div>
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
