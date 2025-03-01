
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BannerTabsBarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function BannerTabsBar({ activeTab, onTabChange }: BannerTabsBarProps) {
  return (
    <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="events">Events Page</TabsTrigger>
        <TabsTrigger value="pet-grooming">Grooming Page</TabsTrigger>
        <TabsTrigger value="all">All Banners</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
