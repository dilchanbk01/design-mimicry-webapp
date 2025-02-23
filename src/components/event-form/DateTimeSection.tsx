
import { Input } from "@/components/ui/input";

interface DateTimeSectionProps {
  date: string;
  time: string;
  onChange: (field: string, value: string) => void;
}

export function DateTimeSection({ date, time, onChange }: DateTimeSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Date & Time</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          required
          value={date}
          onChange={(e) => onChange("date", e.target.value)}
        />
        <Input
          type="time"
          required
          value={time}
          onChange={(e) => onChange("time", e.target.value)}
        />
      </div>
    </div>
  );
}
