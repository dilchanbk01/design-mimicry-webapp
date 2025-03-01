import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerList } from "./banner/BannerList";
import { BannerDialog } from "./banner/BannerDialog";

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  page: string;
}

interface HeroBannerManagementProps {
  searchQuery: string;
}

export function HeroBannerManagement({ searchQuery }: HeroBannerManagementProps) {
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
        const filePath = `hero_banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("images").getPublicUrl(filePath);
        image_url = data.publicUrl;
        setPreviewUrl(image_url);
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
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "Error",
        description: "Failed to save hero banner",
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Hero Banner Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button 
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add New Banner
          </Button>
        </Dialog>
      </div>

      <Tabs defaultValue="events" onValueChange={(value) => setBannerPage(value)}>
        <TabsList>
          <TabsTrigger value="events">Events Page</TabsTrigger>
          <TabsTrigger value="pet-grooming">Pet Grooming Page</TabsTrigger>
        </TabsList>
      </Tabs>

      <BannerList
        banners={banners}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingBanner={editingBanner}
        onSubmit={handleSubmit}
        isUploading={isUploading}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        active={active}
        setActive={setActive}
        previewUrl={previewUrl}
        resetForm={resetForm}
      />
    </div>
  );
}
