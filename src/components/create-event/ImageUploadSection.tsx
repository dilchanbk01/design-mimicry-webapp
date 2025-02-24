
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadSectionProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadSection({ imagePreview, onImageChange }: ImageUploadSectionProps) {
  return (
    <div className="relative h-[200px] bg-gray-100">
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Event preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Label
            htmlFor="image-upload"
            className="cursor-pointer bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50"
          >
            Upload Image
          </Label>
        </div>
      )}
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />
    </div>
  );
}
