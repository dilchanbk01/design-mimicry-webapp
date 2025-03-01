
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface BannerHeaderProps {
  onAddBanner: () => void;
  onUploadPredefined?: () => void;
}

export function BannerHeader({ onAddBanner, onUploadPredefined }: BannerHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold">Hero Banners</h2>
        <p className="text-muted-foreground">Manage banner images for different pages</p>
      </div>
      <div className="flex gap-2">
        {onUploadPredefined && (
          <Button variant="outline" onClick={onUploadPredefined}>
            <Upload className="h-4 w-4 mr-2" />
            Load Sample Banners
          </Button>
        )}
        <Button onClick={onAddBanner}>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>
    </div>
  );
}
