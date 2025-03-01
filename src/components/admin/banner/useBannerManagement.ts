
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  page: string;
}

export function useBannerManagement(searchQuery: string) {
  const { toast } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [bannerPage, setBannerPage] = useState<string>("events");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

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
      let query = supabase.from("hero_banners").select("*").eq("page", bannerPage);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBanners(data || []);
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
    setEditingBanner(null);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setDescription(banner.description || "");
    setActive(banner.active);
    setPreviewUrl(banner.image_url);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, imageFile: File | null) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let image_url = editingBanner?.image_url || "";

      // Upload new image if one was selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("images").getPublicUrl(filePath);
        image_url = data.publicUrl;
        setPreviewUrl(image_url);
      }

      if (!image_url && !editingBanner) {
        throw new Error("An image is required for new banners");
      }

      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from("hero_banners")
          .update({
            title,
            description,
            active,
            image_url: image_url || editingBanner.image_url,
          })
          .eq("id", editingBanner.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Hero banner updated successfully",
        });
      } else {
        // Create new banner
        if (!image_url) {
          throw new Error("An image is required for new banners");
        }
        
        const { error } = await supabase.from("hero_banners").insert({
          title,
          description,
          active,
          image_url,
          page: bannerPage,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Hero banner created successfully",
        });
      }

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
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);

      if (error) throw error;

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
      const { error } = await supabase
        .from("hero_banners")
        .update({ active: !currentActive })
        .eq("id", id);

      if (error) throw error;

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
    editingBanner,
    title,
    setTitle,
    description,
    setDescription,
    active,
    setActive,
    previewUrl,
    handleEdit,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    resetForm
  };
}
