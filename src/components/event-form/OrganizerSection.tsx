
import { Input } from "@/components/ui/input";

interface OrganizerSectionProps {
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerWebsite: string;
  onChange: (field: string, value: string) => void;
}

export function OrganizerSection({
  organizerName,
  organizerEmail,
  organizerPhone,
  organizerWebsite,
  onChange,
}: OrganizerSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Organizer Details</h2>
      <Input
        placeholder="Organizer Name"
        required
        value={organizerName}
        onChange={(e) => onChange("organizerName", e.target.value)}
      />
      <Input
        type="email"
        placeholder="Organizer Email"
        required
        value={organizerEmail}
        onChange={(e) => onChange("organizerEmail", e.target.value)}
      />
      <Input
        placeholder="Organizer Phone"
        value={organizerPhone}
        onChange={(e) => onChange("organizerPhone", e.target.value)}
      />
      <Input
        placeholder="Website/Social Media"
        value={organizerWebsite}
        onChange={(e) => onChange("organizerWebsite", e.target.value)}
      />
    </div>
  );
}
