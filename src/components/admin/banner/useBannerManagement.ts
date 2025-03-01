
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { HeroBanner } from "./types";
import { 
  fetchBannersByPage, 
  createBanner, 
  deleteBanner, 
  toggleBannerStatus 
} from "./bannerApi";
import { uploadBannerImage } from "./useBannerImageUpload";

export function useBannerManagement(searchQuery: string) {
  const { toast } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [bannerPage, setBannerPage] = useState<string>("events");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchBanners();
  }, [bannerPage, searchQuery]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBannersByPage(bannerPage, searchQuery);
      setBanners(data);
    } catch (error) {
      console.error("Error fetching hero banners:", error);
      toast({
        title: "Error",
        description: "Failed to load hero banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setActive(false);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent, imageFile: File | null) => {
    e.preventDefault();
    
    // Validate inputs
    if (!imageFile && !previewUrl) {
      toast({
        title: "Error",
        description: "Please select an image for the banner",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);

    try {
      let image_url = "";

      // Upload new image if one was selected
      if (imageFile) {
        try {
          image_url = await uploadBannerImage(imageFile);
          setPreviewUrl(image_url);
        } catch (error: any) {
          console.error("Error uploading image:", error);
          toast({
            title: "Upload Failed",
            description: error.message || "Failed to upload image",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }

      // Create new banner
      await createBanner({
        title,
        description,
        active,
        image_url,
        page: bannerPage,
      });

      toast({
        title: "Success",
        description: "Hero banner created successfully",
      });

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      console.error("Error saving banner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save hero banner",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await deleteBanner(id);

      toast({
        title: "Success",
        description: "Hero banner deleted successfully",
      });

      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Error",
        description: "Failed to delete hero banner",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleBannerStatus(id, currentActive);

      toast({
        title: "Success",
        description: `Banner ${!currentActive ? "activated" : "deactivated"} successfully`,
      });

      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  return {
    banners,
    loading,
    isUploading,
    bannerPage,
    setBannerPage,
    dialogOpen,
    setDialogOpen,
    title,
    setTitle,
    description,
    setDescription,
    active,
    setActive,
    previewUrl,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    resetForm
  };
}
