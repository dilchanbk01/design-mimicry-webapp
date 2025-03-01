
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign } from "lucide-react";

interface PayoutsTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  eventsPayoutsContent: ReactNode;
  groomersPayoutsContent: ReactNode;
}

export function PayoutsTabs({
  activeTab,
  setActiveTab,
  eventsPayoutsContent,
  groomersPayoutsContent,
}: PayoutsTabsProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CircleDollarSign className="h-5 w-5 mr-2 text-blue-600" />
        Payout Management
      </h2>
      <p className="text-gray-600 mb-4">
        Manage payout requests from event organizers and grooming service providers.
      </p>
      
      <Tabs 
        defaultValue="events" 
        onValueChange={(value) => setActiveTab(value)}
        className="mt-4"
      >
        <TabsList>
          <TabsTrigger value="events">Event Payouts</TabsTrigger>
          <TabsTrigger value="groomers">Groomer Payouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events">
          {eventsPayoutsContent}
        </TabsContent>
        
        <TabsContent value="groomers">
          {groomersPayoutsContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
