
import { Card } from "@/components/Card";
import { useNavigate } from "react-router-dom";

interface ServicesGridProps {
  onEssentialsClick: () => void;
}

export function ServicesGrid({ onEssentialsClick }: ServicesGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-3">
      <Card
        title="Events"
        icon="/lovable-uploads/3ff4430d-913b-49ff-9efc-06a1dda0fa4c.png"
        onClick={() => navigate("/events")}
        className="aspect-[4/3] bg-white hover:scale-[1.02]"
      />
    </div>
  );
}
