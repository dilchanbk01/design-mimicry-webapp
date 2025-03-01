
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Edit } from "lucide-react";
import { compressImage } from "@/utils/imageCompression";
import { toast } from "@/hooks/use-toast";

interface MultipleImageUploadProps {
  images: (File | string)[];
  onImagesChange: (images: (File | string)[]) => void;
  maxImages?: number;
}

export function MultipleImageUpload({ 
  images = [], 
  onImagesChange,
  maxImages = 3
}: MultipleImageUploadProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= maxImages) {
      toast({
        title: `Maximum ${maxImages} images allowed`,
        description: `Please delete an existing image before adding a new one.`,
        variant: "destructive"
      });
      return;
    }

    setIsCompressing(true);
    try {
      const compressedFile = await compressImage(file);
      onImagesChange([...images, compressedFile]);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        title: "Error uploading image",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedFile = await compressImage(file);
      const newImages = [...images];
      newImages[index] = compressedFile;
      onImagesChange(newImages);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        title: "Error replacing image",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative h-40 w-40 border rounded-md overflow-hidden">
            <img
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt={`Groomer image ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Label
                htmlFor={`replace-image-${index}`}
                className="bg-white text-black p-2 rounded-full cursor-pointer"
                title="Replace image"
              >
                <Edit size={16} />
                <Input
                  id={`replace-image-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleReplaceImage(e, index)}
                />
              </Label>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full p-2 h-auto"
                onClick={() => handleDeleteImage(index)}
                title="Delete image"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="h-40 w-40 border rounded-md border-dashed flex items-center justify-center">
            <Label
              htmlFor="add-image"
              className="cursor-pointer text-center p-4"
            >
              {isCompressing ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin h-6 w-6 border-2 border-green-500 rounded-full border-t-transparent"></div>
                  <span className="text-sm">Compressing...</span>
                </div>
              ) : (
                <span>+ Add Image<br />(Max {maxImages})</span>
              )}
              <Input
                id="add-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isCompressing}
              />
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
