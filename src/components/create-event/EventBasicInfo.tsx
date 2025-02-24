
import { Input } from "@/components/ui/input";

interface EventBasicInfoProps {
  title: string;
  type: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  eventTypes: string[];
}

export function EventBasicInfo({ title, type, onTitleChange, onTypeChange, eventTypes }: EventBasicInfoProps) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Event Title"
        required
        value={title}
        onChange={onTitleChange}
        className="text-xl font-semibold"
      />

      <select
        className="w-full rounded-md border border-input bg-background px-3 h-10"
        value={type}
        onChange={onTypeChange}
      >
        {eventTypes.map((type) => (
          <option key={type} value={type.toLowerCase()}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
