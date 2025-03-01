
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Image, Plus } from "lucide-react";

interface BannerHeaderProps {
  onAddBanner: () => void;
}

export function BannerHeader({ onAddBanner }: BannerHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl flex items-center">
        <Image className="h-5 w-5 mr-2 text-purple-600" />
        Page Banners
      </CardTitle>
      <Button 
        onClick={onAddBanner}
        className="flex items-center"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Banner
      </Button>
    </div>
  );
}
