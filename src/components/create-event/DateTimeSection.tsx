
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeSectionProps {
  date: string;
  time: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DateTimeSection({ date, time, onDateChange, onTimeChange }: DateTimeSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          required
          value={date}
          onChange={onDateChange}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Time</Label>
        <Input
          type="time"
          required
          value={time}
          onChange={onTimeChange}
          className="mt-1"
        />
      </div>
    </div>
  );
}
