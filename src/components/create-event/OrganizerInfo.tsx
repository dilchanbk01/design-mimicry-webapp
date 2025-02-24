
import { Input } from "@/components/ui/input";
import { Instagram } from "lucide-react";

interface OrganizerInfoProps {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  onChange: (field: string, value: string) => void;
}

export function OrganizerInfo({ name, email, phone, instagram, onChange }: OrganizerInfoProps) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Organizer Name"
        required
        value={name}
        onChange={(e) => onChange('organizerName', e.target.value)}
      />
      <Input
        type="email"
        placeholder="Organizer Email"
        required
        value={email}
        onChange={(e) => onChange('organizerEmail', e.target.value)}
      />
      <Input
        placeholder="Organizer Phone"
        value={phone}
        onChange={(e) => onChange('organizerPhone', e.target.value)}
      />
      <div className="relative">
        <Input
          placeholder="Instagram Handle (optional)"
          value={instagram}
          onChange={(e) => onChange('instagram', e.target.value)}
          className="pl-10"
        />
        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
