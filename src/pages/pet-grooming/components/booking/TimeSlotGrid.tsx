
interface TimeSlotGridProps {
  timeSlots: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotGrid({ timeSlots, selectedTime, onTimeSelect }: TimeSlotGridProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
      <div className="grid grid-cols-4 gap-3">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
            className={`p-3 text-center rounded-md transition-colors ${
              selectedTime === time
                ? 'bg-green-100 text-green-800 font-medium'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}
