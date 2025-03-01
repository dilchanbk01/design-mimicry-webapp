
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays } from "lucide-react";

interface EventFiltersProps {
  activeFilter: string;
}

export function EventFilters({ activeFilter }: EventFiltersProps) {
  return (
    <TabsList className="mb-4">
      <TabsTrigger value="all">All Events</TabsTrigger>
      <TabsTrigger value="active">Active Events</TabsTrigger>
      <TabsTrigger value="pending">Pending</TabsTrigger>
      <TabsTrigger value="approved">Approved</TabsTrigger>
      <TabsTrigger value="rejected">Rejected</TabsTrigger>
    </TabsList>
  );
}
