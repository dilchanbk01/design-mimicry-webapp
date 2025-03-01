
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, CircleDollarSign, Image } from "lucide-react";

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  eventsContent: ReactNode;
  payoutsContent: ReactNode;
  groomersContent: ReactNode;
  bannersContent: ReactNode;
}

export function AdminDashboardTabs({
  activeTab,
  setActiveTab,
  eventsContent,
  payoutsContent,
  groomersContent,
  bannersContent
}: AdminDashboardTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value)}
      className="space-y-4"
    >
      <TabsList className="w-full sm:w-auto grid grid-cols-4 md:flex">
        <TabsTrigger value="events" className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          Events
        </TabsTrigger>
        <TabsTrigger value="payouts" className="flex items-center">
          <CircleDollarSign className="h-4 w-4 mr-2" />
          Payouts
        </TabsTrigger>
        <TabsTrigger value="groomers" className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Groomers
        </TabsTrigger>
        <TabsTrigger value="banners" className="flex items-center">
          <Image className="h-4 w-4 mr-2" />
          Banners
        </TabsTrigger>
      </TabsList>

      <TabsContent value="events" className="space-y-4">
        {eventsContent}
      </TabsContent>

      <TabsContent value="payouts">
        {payoutsContent}
      </TabsContent>

      <TabsContent value="groomers">
        {groomersContent}
      </TabsContent>

      <TabsContent value="banners">
        {bannersContent}
      </TabsContent>
    </Tabs>
  );
}
