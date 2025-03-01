
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent, imageFile: File | null) => void;
  isUploading: boolean;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  active: boolean;
  setActive: (value: boolean) => void;
  previewUrl: string;
  resetForm: () => void;
}

export function BannerDialog({
  open,
  onOpenChange,
  onSubmit,
  isUploading,
  title,
  setTitle,
  description,
  setDescription,
  active,
  setActive,
  previewUrl,
  resetForm
}: BannerDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setImageFile(null);
      setImageError(null);
      setLocalPreview(null);
      setSubmitAttempted(false);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setImageError("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image file is too large (max 5MB)");
        return;
      }
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLocalPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setImageFile(file);

      // Show a toast notification that the image was selected
      toast.success("Image selected successfully", {
        description: "Preview is now visible",
      });
    }
  };

  const handleSubmitWithValidation = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Validate inputs before submission
    if (!imageFile && !previewUrl) {
      setImageError("Please select an image for the banner");
      return;
    }
    
    onSubmit(e, imageFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitWithValidation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Banner Title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Banner Description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Banner Image <span className="text-red-500">*</span></Label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg, image/png, image/gif, image/webp"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={isUploading}
            />
            {(imageError && submitAttempted) && <p className="text-sm text-red-500">{imageError}</p>}
            
            {/* Show local preview */}
            {localPreview && (
              <div className="mt-2 relative">
                <img
                  src={localPreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md"
                />
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Preview
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Selected banners will appear on the Events and Grooming pages based on the page selection.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              disabled={isUploading}
            />
            <Label htmlFor="active">
              Active
              <span className="ml-1 text-xs text-gray-500">
                (Make this banner visible on the website)
              </span>
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Saving..." : "Save Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
