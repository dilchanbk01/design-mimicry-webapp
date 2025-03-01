
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/imageCompression";

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  page: string;
}

interface BannerCardProps {
  banner: HeroBanner;
  onEdit: (banner: HeroBanner) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function BannerCard({ banner, onEdit, onDelete, onToggleActive }: BannerCardProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow">
      <div className="h-40 relative">
        <img
          src={getOptimizedImageUrl(banner.image_url, 800)}
          alt={banner.title || "Hero banner"}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          banner.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {banner.active ? "Active" : "Inactive"}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{banner.title || "Untitled"}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 h-10">
          {banner.description || "No description"}
        </p>
        <div className="flex justify-between mt-4">
          <Button size="sm" variant="outline" onClick={() => onEdit(banner)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={banner.active ? "outline" : "default"}
              onClick={() => onToggleActive(banner.id, banner.active)}
            >
              {banner.active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(banner.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
