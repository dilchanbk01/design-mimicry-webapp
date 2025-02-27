
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DateSelectionProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelection({ selectedDate, onDateChange }: DateSelectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
      <div className="flex items-center space-x-4">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          min={format(new Date(), 'yyyy-MM-dd')}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
