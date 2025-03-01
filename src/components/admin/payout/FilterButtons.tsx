
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CircleDollarSign,
  Filter
} from "lucide-react";

interface FilterButtonsProps {
  statusFilter: string | null;
  setStatusFilter: (filter: string | null) => void;
}

export function FilterButtons({ statusFilter, setStatusFilter }: FilterButtonsProps) {
  const getFilterButtonClass = (status: string | null) => {
    return `px-3 py-1 text-xs rounded-full ${
      statusFilter === status
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <div className="flex items-center mr-2">
        <Filter className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-sm text-gray-500">Filter:</span>
      </div>
      <button
        className={getFilterButtonClass(null)}
        onClick={() => setStatusFilter(null)}
      >
        All
      </button>
      <button
        className={getFilterButtonClass('waiting_for_review')}
        onClick={() => setStatusFilter('waiting_for_review')}
      >
        <Clock className="h-3 w-3 inline mr-1" />
        Awaiting Review
      </button>
      <button
        className={getFilterButtonClass('processing')}
        onClick={() => setStatusFilter('processing')}
      >
        <CircleDollarSign className="h-3 w-3 inline mr-1" />
        Processing
      </button>
      <button
        className={getFilterButtonClass('payment_sent')}
        onClick={() => setStatusFilter('payment_sent')}
      >
        <CheckCircle className="h-3 w-3 inline mr-1" />
        Completed
      </button>
      <button
        className={getFilterButtonClass('rejected')}
        onClick={() => setStatusFilter('rejected')}
      >
        <XCircle className="h-3 w-3 inline mr-1" />
        Rejected
      </button>
    </div>
  );
}
