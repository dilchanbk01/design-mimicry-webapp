
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, CircleDollarSign } from "lucide-react";

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  eventsContent: ReactNode;
  payoutsContent: ReactNode;
  groomersContent: ReactNode;
}

export function AdminDashboardTabs({
  activeTab,
  setActiveTab,
  eventsContent,
  payoutsContent,
  groomersContent
}: AdminDashboardTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value)}
      className="space-y-4"
    >
      <TabsList className="w-full sm:w-auto grid grid-cols-3 md:flex">
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
    </Tabs>
  );
}
