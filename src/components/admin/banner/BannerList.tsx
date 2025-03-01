
import { HeroBanner } from "./types";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface BannerListProps {
  banners: HeroBanner[];
  isLoading: boolean;
  searchQuery: string;
  activeTab: string;
  onToggleActive: (banner: HeroBanner) => void;
  onDeleteBanner: (id: string) => void;
}

export function BannerList({
  banners,
  isLoading,
  searchQuery,
  activeTab,
  onToggleActive,
  onDeleteBanner
}: BannerListProps) {
  const filteredBanners = banners.filter(banner => 
    (activeTab === 'all' || banner.page === activeTab) &&
    (!searchQuery || 
      (banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       banner.description?.toLowerCase().includes(searchQuery.toLowerCase())))
  );

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
                    onClick={() => onToggleActive(banner)}
                    className={banner.active ? "bg-white text-gray-800" : ""}
                  >
                    {banner.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteBanner(banner.id)}
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
  );
}
