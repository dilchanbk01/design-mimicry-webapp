
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageBannerDialog } from "./banner/PageBannerDialog";
import { HeroBanner } from "./banner/types";

interface HeroBannerManagementProps {
  searchQuery: string;
}

export function HeroBannerManagement({ searchQuery }: HeroBannerManagementProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

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
      const { error } = await supabase
        .from('hero_banners')
        .insert([banner]);

      if (error) throw error;
      
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

  const filteredBanners = banners.filter(banner => 
    (activeTab === 'all' || banner.page === activeTab) &&
    (!searchQuery || 
      (banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       banner.description?.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Image className="h-5 w-5 mr-2 text-purple-600" />
          Page Banners
        </CardTitle>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Banner
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="events" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="events">Events Page</TabsTrigger>
            <TabsTrigger value="pet-grooming">Grooming Page</TabsTrigger>
            <TabsTrigger value="all">All Banners</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="pt-2">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-8">
                <Image className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {searchQuery 
                    ? "No banners matching your search" 
                    : `No banners for ${activeTab === 'all' ? 'any page' : 'this page'} yet`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBanners.map(banner => (
                  <div 
                    key={banner.id}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    <img 
                      src={banner.image_url} 
                      alt={banner.title || "Hero banner"} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{banner.title || "Untitled Banner"}</p>
                            <p className="text-sm text-gray-300">
                              Page: {banner.page === 'events' ? 'Events' : 'Pet Grooming'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant={banner.active ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleActive(banner)}
                              className={banner.active ? "bg-white text-gray-800" : ""}
                            >
                              {banner.active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {banner.active && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <PageBannerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleCreateBanner}
      />
    </Card>
  );
}
