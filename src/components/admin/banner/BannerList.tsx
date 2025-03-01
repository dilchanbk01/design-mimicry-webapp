
import { HeroBanner } from "./types";
import { BannerCard } from "./BannerCard";

interface BannerListProps {
  banners: HeroBanner[];
  loading: boolean;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function BannerList({ banners, loading, onDelete, onToggleActive }: BannerListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border rounded-lg overflow-hidden shadow animate-pulse">
            <div className="h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-10 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500">No banners found. Add a new banner to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {banners.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
