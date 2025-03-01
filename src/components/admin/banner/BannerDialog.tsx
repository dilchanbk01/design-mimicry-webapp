
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

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  page: string;
}

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBanner: HeroBanner | null;
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
  editingBanner,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      // This is handled by the parent component's previewUrl
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => onSubmit(e, imageFile)} className="space-y-4">
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
            <Label htmlFor="image">Banner Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-2 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
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
