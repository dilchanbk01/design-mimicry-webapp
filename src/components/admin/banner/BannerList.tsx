
import { HeroBanner } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Edit, Trash2, Check, X } from "lucide-react";

interface BannerListProps {
  banners: HeroBanner[];
  isLoading: boolean;
  searchQuery: string;
  activeTab: string;
  onToggleActive: (banner: HeroBanner) => void;
  onDeleteBanner: (id: string) => void;
  onEditBanner: (banner: HeroBanner) => void;
}

export function BannerList({
  banners,
  isLoading,
  searchQuery,
  activeTab,
  onToggleActive,
  onDeleteBanner,
  onEditBanner
}: BannerListProps) {
  const filteredBanners = banners.filter(banner => 
    (activeTab === 'all' || banner.page === activeTab) &&
    (!searchQuery || 
      (banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       banner.description?.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const activeBanners = filteredBanners.filter(banner => banner.active);

  console.log("Filtered banners:", filteredBanners);
  console.log("Active banners:", activeBanners);
  console.log("Active tab:", activeTab);
  console.log("Search query:", searchQuery);
  console.log("All banners:", banners);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredBanners.length === 0) {
    return (
      <div className="text-center py-8">
        <Image className="h-10 w-10 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">
          {searchQuery 
            ? "No banners matching your search" 
            : `No banners for ${activeTab === 'all' ? 'any page' : 'this page'} yet`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activeBanners.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <Badge variant="default" className="bg-green-500 mr-2">Active</Badge>
            <h3 className="text-lg font-medium">Currently Active Banners</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {activeBanners.map(banner => (
              <div 
                key={`active-${banner.id}`}
                className="relative border rounded-lg overflow-hidden bg-gray-50"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 h-40">
                    <img 
                      src={banner.image_url} 
                      alt={banner.title || "Hero banner"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{banner.title || "Untitled Banner"}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Page: {banner.page === 'events' ? 'Events' : 'Pet Grooming'}
                        </p>
                        {banner.description && (
                          <p className="text-sm mb-2">{banner.description}</p>
                        )}
                      </div>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditBanner(banner)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(banner)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteBanner(banner.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-b border-gray-200 mb-6"></div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-4">All Banners</h3>
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
                        variant="outline"
                        size="sm"
                        onClick={() => onEditBanner(banner)}
                        className="bg-white text-gray-800"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={banner.active ? "outline" : "default"}
                        size="sm"
                        onClick={() => onToggleActive(banner)}
                        className={banner.active ? "bg-white text-gray-800" : ""}
                      >
                        {banner.active ? <X className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                        {banner.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteBanner(banner.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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
      </div>
    </div>
  );
}
