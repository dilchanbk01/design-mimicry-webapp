
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBannerImageUpload } from "./useBannerImageUpload";
import { useToast } from "@/hooks/use-toast";
import { HeroBanner } from "./types";

interface PageBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (banner: Partial<HeroBanner>) => Promise<void>;
}

export function PageBannerDialog({ open, onOpenChange, onSave }: PageBannerDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [page, setPage] = useState<string>("events");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const { 
    imagePreview, 
    isUploading, 
    uploadProgress, 
    uploadImage, 
    resetUpload,
    imageUrl
  } = useBannerImageUpload();

  // Debug logging
  useEffect(() => {
    console.log("Image URL status:", { imageUrl, isUploading });
  }, [imageUrl, isUploading]);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setTitle("");
      setDescription("");
      setPage("events");
      resetUpload();
    }
  }, [open, resetUpload]);

  const handleSave = async () => {
    if (!imageUrl) {
      toast({
        title: "Missing image",
        description: "Please upload an image for the banner",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title,
        description,
        image_url: imageUrl,
        page,
        active: true
      });
      
      onOpenChange(false);
      toast({
        title: "Banner created",
        description: "The banner has been created successfully"
      });
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "Error",
        description: "Failed to create banner",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Banner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="page">Page</Label>
            <Select value={page} onValueChange={setPage}>
              <SelectTrigger>
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">Events Page</SelectItem>
                <SelectItem value="pet-grooming">Pet Grooming Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter banner title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter banner description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Banner Image</Label>
            <div 
              className="border-2 border-dashed rounded-md p-4 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Banner preview" 
                    className="w-full h-40 object-cover rounded" 
                  />
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                  <span>Click to upload image</span>
                  <span className="text-sm mt-2">(Recommended size: 1200 x 300px)</span>
                </div>
              )}
              
              {isUploading && (
                <div className="w-full mt-2 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              <Input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    uploadImage(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-gray-500">
            <p>Image upload status: {isUploading ? 'Uploading...' : imageUrl ? 'Complete' : 'Not started'}</p>
            {imageUrl && <p>Image URL is set</p>}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading || !imageUrl}
          >
            {isSaving ? "Saving..." : "Save Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
