
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroomersFilterProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export function GroomersFilter({ activeFilter, onFilterChange }: GroomersFilterProps) {
  return (
    <TabsList className="mb-4">
      <TabsTrigger value="all" onClick={() => onFilterChange("all")}>All Groomers</TabsTrigger>
      <TabsTrigger value="pending" onClick={() => onFilterChange("pending")}>Pending</TabsTrigger>
      <TabsTrigger value="approved" onClick={() => onFilterChange("approved")}>Approved</TabsTrigger>
      <TabsTrigger value="rejected" onClick={() => onFilterChange("rejected")}>Rejected</TabsTrigger>
    </TabsList>
  );
}
