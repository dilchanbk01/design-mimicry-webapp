
import { supabase } from "@/integrations/supabase/client";
import { HeroBanner } from "./types";

export const BannerService = {
  fetchBanners: async (): Promise<HeroBanner[]> => {
    try {
      console.log("Fetching banners from Supabase");
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching banners:", error);
        throw error;
      }
      
      console.log("Fetched banners:", data);
      return data || [];
    } catch (error) {
      console.error("Error fetching banners:", error);
      throw error;
    }
  },

  createBanner: async (banner: Partial<HeroBanner>): Promise<void> => {
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
        .insert(bannerToInsert);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error creating banner:", error);
      throw error;
    }
  },

  updateBanner: async (id: string, banner: Partial<HeroBanner>): Promise<void> => {
    try {
      console.log(`Updating banner ${id} with data:`, banner);
      const { error } = await supabase
        .from('hero_banners')
        .update(banner)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating banner:", error);
      throw error;
    }
  },

  deleteBanner: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting banner ${id}`);
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting banner:", error);
      throw error;
    }
  },

  toggleActive: async (id: string, active: boolean): Promise<void> => {
    try {
      console.log(`Toggling banner ${id} active status to ${active}`);
      const { error } = await supabase
        .from('hero_banners')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling banner status:", error);
      throw error;
    }
  }
};
