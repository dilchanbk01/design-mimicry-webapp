
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays } from "lucide-react";

interface EventFiltersProps {
  activeFilter: string;
  onFilterChange?: (filter: string) => void;
}

export function EventFilters({ activeFilter, onFilterChange }: EventFiltersProps) {
  return (
    <TabsList className="mb-4">
      <TabsTrigger 
        value="all" 
        onClick={() => onFilterChange && onFilterChange('all')}
      >
        All Events
      </TabsTrigger>
      <TabsTrigger 
        value="active" 
        onClick={() => onFilterChange && onFilterChange('active')}
      >
        Active Events
      </TabsTrigger>
      <TabsTrigger 
        value="pending" 
        onClick={() => onFilterChange && onFilterChange('pending')}
      >
        Pending
      </TabsTrigger>
      <TabsTrigger 
        value="approved" 
        onClick={() => onFilterChange && onFilterChange('approved')}
      >
        Approved
      </TabsTrigger>
      <TabsTrigger 
        value="rejected" 
        onClick={() => onFilterChange && onFilterChange('rejected')}
      >
        Rejected
      </TabsTrigger>
    </TabsList>
  );
}
