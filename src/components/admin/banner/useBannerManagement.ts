
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroBanner } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useBannerImageUpload } from "./useBannerImageUpload";

export function useBannerManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { 
    imagePreview, 
    isUploading, 
    uploadProgress, 
    uploadImage, 
    resetUpload,
    imageUrl 
  } = useBannerImageUpload();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (banner: Partial<HeroBanner>) => {
    try {
      // Ensure required fields are present
      if (!banner.image_url || !banner.page) {
        throw new Error("Missing required fields: image_url and page are required");
      }
      
      // Create a properly typed banner object with required fields
      const bannerToInsert = {
        image_url: banner.image_url,
        page: banner.page,
        title: banner.title || null,
        description: banner.description || null,
        active: banner.active || false
      };
      
      const { error } = await supabase
        .from('hero_banners')
        .insert([bannerToInsert]);

      if (error) throw error;
      
      // Refresh the banner list
      fetchBanners();
      
      toast({
        title: "Success",
        description: "Banner created successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error creating banner:", error);
      toast({
        title: "Error",
        description: "Failed to create banner",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setBanners(banners.filter(banner => banner.id !== id));
      
      toast({
        title: "Success",
        description: "Banner deleted successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleBannerActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setBanners(banners.map(banner => 
        banner.id === id ? { ...banner, active: !currentActive } : banner
      ));
      
      toast({
        title: "Success",
        description: `Banner ${currentActive ? 'deactivated' : 'activated'} successfully`
      });
      
      return true;
    } catch (error) {
      console.error("Error toggling banner status:", error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    banners,
    loading,
    createBanner,
    deleteBanner,
    toggleBannerActive,
    fetchBanners,
    uploadImage,
    isUploading,
    uploadProgress,
    imagePreview,
    resetUpload,
    imageUrl
  };
}
