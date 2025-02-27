
import { useState } from "react";
import { Clock } from "lucide-react";

interface TimeSlotSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  isProcessing?: boolean;
}

// Generate time slots from 9 AM to 7 PM with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  const startTime = 9; // 9 AM
  const endTime = 19; // 7 PM
  
  for (let hour = startTime; hour < endTime; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  return slots;
};

export function TimeSlotSelector({ 
  selectedTime, 
  onTimeSelect,
  isProcessing = false
}: TimeSlotSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeSlots = generateTimeSlots();

  return (
    <div className="relative">
      <div 
        className={`bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 flex items-center justify-between cursor-pointer ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:border-green-500'}`}
        onClick={() => !isProcessing && setShowDropdown(!showDropdown)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <span className={`text-sm ${selectedTime ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedTime || "Select time slot"}
        </span>
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 grid grid-cols-3 gap-1">
            {timeSlots.map((time) => (
              <div
                key={time}
                className={`text-sm py-2 px-1 text-center rounded cursor-pointer ${
                  selectedTime === time 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  onTimeSelect(time);
                  setShowDropdown(false);
                }}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
