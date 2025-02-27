
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/utils/imageCompression";

interface ImageUploadSectionProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadSection({ imagePreview, onImageChange }: ImageUploadSectionProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedFile = await compressImage(file);
        const newEvent = new Event('change', { bubbles: true });
        Object.defineProperty(newEvent, 'target', {
          writable: false,
          value: { files: [compressedFile], type: 'file' }
        });
        onImageChange(newEvent as any);
      } catch (error) {
        console.error('Error compressing image:', error);
        onImageChange(e);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="relative h-[200px] bg-gray-100">
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Event preview"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Label
            htmlFor="image-upload"
            className="cursor-pointer bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50"
          >
            {isCompressing ? "Compressing..." : "Upload Image"}
          </Label>
        </div>
      )}
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
}
