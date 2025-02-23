
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EventDetailsSectionProps {
  title: string;
  type: string;
  description: string;
  image: File | null;
  eventTypes: string[];
  onChange: (field: string, value: string | File | null) => void;
}

export function EventDetailsSection({
  title,
  type,
  description,
  eventTypes,
  onChange,
}: EventDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Event Details</h2>
      <Input
        required
        placeholder="Event Name"
        value={title}
        onChange={(e) => onChange("title", e.target.value)}
      />
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2"
        value={type}
        onChange={(e) => onChange("type", e.target.value)}
      >
        {eventTypes.map((type) => (
          <option key={type} value={type.toLowerCase()}>
            {type}
          </option>
        ))}
      </select>
      <Textarea
        placeholder="Event Description"
        value={description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
      />
      <Input
        type="file"
        accept="image/*"
        onChange={(e) =>
          onChange("image", e.target.files ? e.target.files[0] : null)
        }
      />
    </div>
  );
}
