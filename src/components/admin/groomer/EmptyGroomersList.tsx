
import { Scissors } from "lucide-react";

interface EmptyGroomersListProps {
  searchQuery: string;
  activeFilter: string;
}

export function EmptyGroomersList({ searchQuery, activeFilter }: EmptyGroomersListProps) {
  return (
    <div className="text-center py-8">
      <Scissors className="h-10 w-10 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-500">
        {searchQuery 
          ? "No groomers matching your search" 
          : `No ${activeFilter === 'all' ? '' : activeFilter} groomers found`}
      </p>
    </div>
  );
}
