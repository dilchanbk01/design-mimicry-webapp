
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroomersFilterProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export function GroomersFilter({ activeFilter, onFilterChange }: GroomersFilterProps) {
  return (
    <TabsList className="mb-4">
      <TabsTrigger 
        value="all" 
        onClick={() => onFilterChange("all")}
        className={activeFilter === "all" ? "bg-primary text-primary-foreground" : ""}
      >
        All Groomers
      </TabsTrigger>
      <TabsTrigger 
        value="pending" 
        onClick={() => onFilterChange("pending")}
        className={activeFilter === "pending" ? "bg-amber-500 text-white" : ""}
      >
        Pending
      </TabsTrigger>
      <TabsTrigger 
        value="approved" 
        onClick={() => onFilterChange("approved")}
        className={activeFilter === "approved" ? "bg-green-500 text-white" : ""}
      >
        Approved
      </TabsTrigger>
      <TabsTrigger 
        value="rejected" 
        onClick={() => onFilterChange("rejected")}
        className={activeFilter === "rejected" ? "bg-red-500 text-white" : ""}
      >
        Rejected
      </TabsTrigger>
    </TabsList>
  );
}
