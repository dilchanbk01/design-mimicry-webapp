
import { Input } from "@/components/ui/input";

interface TicketingSectionProps {
  price: number;
  capacity: number;
  onChange: (field: string, value: number) => void;
}

export function TicketingSection({
  price,
  capacity,
  onChange,
}: TicketingSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Ticketing & Pricing</h2>
      <Input
        type="number"
        placeholder="Ticket Price"
        value={price}
        onChange={(e) => onChange("price", Number(e.target.value))}
      />
      <Input
        type="number"
        placeholder="Maximum Attendees"
        value={capacity}
        onChange={(e) => onChange("capacity", Number(e.target.value))}
      />
    </div>
  );
}
