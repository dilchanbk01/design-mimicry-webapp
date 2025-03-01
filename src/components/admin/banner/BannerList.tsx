
import { useState } from "react";
import { BannerCard } from "./BannerCard";

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  page: string;
}

interface BannerListProps {
  banners: HeroBanner[];
  loading: boolean;
  onEdit: (banner: HeroBanner) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function BannerList({
  banners,
  loading,
  onEdit,
  onDelete,
  onToggleActive
}: BannerListProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hero banners found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {banners.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
