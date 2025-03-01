
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PageBannerDialog } from "./banner/PageBannerDialog";
import { EditBannerDialog } from "./banner/EditBannerDialog";
import { HeroBanner } from "./banner/types";
import { BannerList } from "./banner/BannerList";
import { BannerTabsBar } from "./banner/BannerTabsBar";
import { BannerHeader } from "./banner/BannerHeader";
import { useBannerImageUpload } from "./banner/useBannerImageUpload";
import { BannerService } from "./banner/BannerService";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HeroBannerManagementProps {
  searchQuery: string;
}

export function HeroBannerManagement({ searchQuery }: HeroBannerManagementProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);
  const [bannerIdToDelete, setBannerIdToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { uploadImageFromUrl } = useBannerImageUpload();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await BannerService.fetchBanners();
      setBanners(data);
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
      await BannerService.createBanner(banner);
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

  const handleUpdateBanner = async (id: string, banner: Partial<HeroBanner>) => {
    try {
      await BannerService.updateBanner(id, banner);
      fetchBanners();
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        title: "Error",
        description: "Failed to update banner",
        variant: "destructive"
      });
      throw error;
    }
  };

  const confirmDeleteBanner = (id: string) => {
    setBannerIdToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteBanner = async () => {
    if (!bannerIdToDelete) return;
    
    try {
      await BannerService.deleteBanner(bannerIdToDelete);
      
      // Find the banner to get its image URL
      const bannerToDelete = banners.find(b => b.id === bannerIdToDelete);
      
      // Update the local state
      setBanners(banners.filter(banner => banner.id !== bannerIdToDelete));
      
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
    } finally {
      setShowDeleteDialog(false);
      setBannerIdToDelete(null);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      await BannerService.toggleActive(banner.id, !banner.active);
      
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

  const handleEditBanner = (banner: HeroBanner) => {
    setSelectedBanner(banner);
    setShowEditDialog(true);
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
            onDeleteBanner={confirmDeleteBanner}
            onEditBanner={handleEditBanner}
          />
        </TabsContent>
      </CardContent>

      {/* Add Banner Dialog */}
      <PageBannerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleCreateBanner}
      />

      {/* Edit Banner Dialog */}
      <EditBannerDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={handleUpdateBanner}
        banner={selectedBanner}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner
              and remove the image from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBanner} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
