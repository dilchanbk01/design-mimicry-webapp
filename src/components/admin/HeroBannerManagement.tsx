
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageBannerDialog } from "./banner/PageBannerDialog";
import { HeroBanner } from "./banner/types";
import { BannerList } from "./banner/BannerList";
import { BannerTabsBar } from "./banner/BannerTabsBar";
import { BannerHeader } from "./banner/BannerHeader";
import { useBannerImageUpload } from "./banner/useBannerImageUpload";

interface HeroBannerManagementProps {
  searchQuery: string;
}

export function HeroBannerManagement({ searchQuery }: HeroBannerManagementProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { uploadImageFromUrl } = useBannerImageUpload();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .or('page.eq.events,page.eq.pet-grooming');

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

  const handleCreateBanner = async (banner: Partial<HeroBanner>) => {
    try {
      console.log("Creating banner with data:", banner);
      
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
      
      console.log("Inserting banner:", bannerToInsert);
      
      // Insert a single object rather than an array
      const { error } = await supabase
        .from('hero_banners')
        .insert(bannerToInsert);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      
      console.log("Banner created successfully");
      
      // Refresh the banner list
      fetchBanners();
      
      toast({
        title: "Success",
        description: "Banner created successfully",
      });
    } catch (error) {
      console.error("Error creating banner:", error);
      toast({
        title: "Error",
        description: "Failed to create banner",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update the local state
      setBanners(banners.filter(banner => banner.id !== id));
      
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ active: !banner.active })
        .eq('id', banner.id);

      if (error) throw error;
      
      // Update the local state
      setBanners(banners.map(b => 
        b.id === banner.id ? { ...b, active: !b.active } : b
      ));
      
      toast({
        title: "Success",
        description: `Banner ${banner.active ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling banner status:", error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive"
      });
    }
  };

  // Function to upload predefined banners
  const uploadPredefinedBanners = async () => {
    try {
      setLoading(true);
      
      // Upload event banner image
      const eventBannerUrl = "/lovable-uploads/ae5772e4-e5b8-4b95-8052-0747161147db.png";
      const eventImageUrl = await uploadImageFromUrl(eventBannerUrl, "events");
      
      if (eventImageUrl) {
        // Create the events banner
        await handleCreateBanner({
          page: "events",
          image_url: eventImageUrl,
          title: "Welcome to Petsu Events",
          description: "Find pet-friendly events near you",
          active: true
        });
      }
      
      // Upload groomer banner image
      const groomerBannerUrl = "/lovable-uploads/db661ae8-128e-451b-9079-f53934630548.png";
      const groomerImageUrl = await uploadImageFromUrl(groomerBannerUrl, "pet-grooming");
      
      if (groomerImageUrl) {
        // Create the grooming banner
        await handleCreateBanner({
          page: "pet-grooming",
          image_url: groomerImageUrl,
          title: "Professional Pet Grooming",
          description: "Find the best groomers for your pets",
          active: true
        });
      }
      
      toast({
        title: "Success",
        description: "Predefined banners uploaded successfully",
      });
      
    } catch (error) {
      console.error("Error uploading predefined banners:", error);
      toast({
        title: "Error",
        description: "Failed to upload predefined banners",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <BannerHeader 
          onAddBanner={() => setShowAddDialog(true)} 
          onUploadPredefined={uploadPredefinedBanners}
        />
      </CardHeader>
      <CardContent>
        <BannerTabsBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <TabsContent value={activeTab} className="pt-2">
          <BannerList 
            banners={banners}
            isLoading={loading}
            searchQuery={searchQuery}
            activeTab={activeTab}
            onToggleActive={handleToggleActive}
            onDeleteBanner={handleDeleteBanner}
          />
        </TabsContent>
      </CardContent>

      <PageBannerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleCreateBanner}
      />
    </Card>
  );
}
