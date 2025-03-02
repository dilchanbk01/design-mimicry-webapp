
import { Scissors } from "lucide-react";

interface EmptyGroomersListProps {
  searchQuery: string;
  activeFilter: string;
}

export function EmptyGroomersList({ searchQuery, activeFilter }: EmptyGroomersListProps) {
  console.log("EmptyGroomersList render:", { searchQuery, activeFilter });
  
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <Scissors className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      {searchQuery ? (
        <p className="text-gray-500 text-lg">No groomers matching your search criteria</p>
      ) : (
        <>
          <p className="text-gray-700 font-medium text-lg mb-1">
            {activeFilter === 'all' ? 'No groomers found' : 
             activeFilter === 'pending' ? 'No pending groomers found' :
             activeFilter === 'approved' ? 'No approved groomers found' :
             'No rejected groomers found'}
          </p>
          <p className="text-gray-500 text-sm">
            {activeFilter === 'pending' && 'New applications will appear here for review'}
            {activeFilter === 'approved' && 'Approved groomers will be visible to customers'}
            {activeFilter === 'rejected' && 'Rejected applications are stored here for reference'}
            {activeFilter === 'all' && 'Once groomers sign up, they will appear here'}
          </p>
        </>
      )}
    </div>
  );
}
