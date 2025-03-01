
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { GroomerFormData } from "./schema";
import { SpecializationsSelect } from "./SpecializationsSelect";
import { MultipleImageUpload } from "./MultipleImageUpload";
import { AlertCircle } from "lucide-react";

interface GroomerFormFieldsProps {
  formData: GroomerFormData;
  validationErrors?: Record<string, string>;
  onFormDataChange: (updates: Partial<GroomerFormData>) => void;
  onSpecializationToggle: (specialization: string) => void;
  onImageChange: (file: File) => void;
  onImagesChange: (images: (File | string)[]) => void;
}

export function GroomerFormFields({
  formData,
  validationErrors = {},
  onFormDataChange,
  onSpecializationToggle,
  onImageChange,
  onImagesChange
}: GroomerFormFieldsProps) {
  // Helper to display error message
  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    if (!validationErrors[fieldName]) return null;
    return (
      <div className="text-red-500 text-xs flex items-center mt-1">
        <AlertCircle className="h-3 w-3 mr-1" />
        {validationErrors[fieldName]}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profileImage">Profile Image (Main)</Label>
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
          className={`cursor-pointer ${validationErrors.profileImage ? 'border-red-500' : ''}`}
        />
        <ErrorMessage fieldName="profileImage" />
        <p className="text-xs text-gray-500">This will be your main profile image</p>
      </div>

      <div className="space-y-2">
        <Label>Additional Images (Max 3)</Label>
        <MultipleImageUpload 
          images={formData.profileImages || []}
          onImagesChange={onImagesChange}
          maxImages={3}
        />
        <ErrorMessage fieldName="profileImages" />
        <p className="text-xs text-gray-500">Add up to 3 images of your salon or previous work</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salonName">Salon Name</Label>
        <Input
          id="salonName"
          value={formData.salonName}
          onChange={(e) => onFormDataChange({ salonName: e.target.value })}
          required
          className={validationErrors.salonName ? 'border-red-500' : ''}
        />
        <ErrorMessage fieldName="salonName" />
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
          <ErrorMessage fieldName="serviceType" />
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
          className={validationErrors.experienceYears ? 'border-red-500' : ''}
        />
        <ErrorMessage fieldName="experienceYears" />
      </div>

      <SpecializationsSelect
        selectedSpecializations={formData.specializations}
        onToggleSpecialization={onSpecializationToggle}
        error={validationErrors.specializations}
      />

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="streetAddress">Street Address</Label>
          <Input
            id="streetAddress"
            value={formData.streetAddress}
            onChange={(e) => onFormDataChange({ streetAddress: e.target.value })}
            placeholder="Building name, Street name"
            required
            className={validationErrors.streetAddress ? 'border-red-500' : ''}
          />
          <ErrorMessage fieldName="streetAddress" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onFormDataChange({ city: e.target.value })}
              required
              className={validationErrors.city ? 'border-red-500' : ''}
            />
            <ErrorMessage fieldName="city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                onFormDataChange({ pincode: value })
              }}
              maxLength={6}
              required
              className={validationErrors.pincode ? 'border-red-500' : ''}
            />
            <ErrorMessage fieldName="pincode" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => onFormDataChange({ contactNumber: e.target.value })}
          required
          className={validationErrors.contactNumber ? 'border-red-500' : ''}
        />
        <ErrorMessage fieldName="contactNumber" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onFormDataChange({ bio: e.target.value })}
          placeholder="Tell us about your grooming experience and services..."
          className={`h-32 ${validationErrors.bio ? 'border-red-500' : ''}`}
        />
        <ErrorMessage fieldName="bio" />
      </div>
    </div>
  );
}
