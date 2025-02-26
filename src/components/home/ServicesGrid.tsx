
import { Card } from "@/components/Card";
import { useNavigate } from "react-router-dom";

interface ServicesGridProps {
  onEssentialsClick: () => void;
}

export function ServicesGrid({ onEssentialsClick }: ServicesGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card
        title="Events"
        icon="/lovable-uploads/3ff4430d-913b-49ff-9efc-06a1dda0fa4c.png"
        onClick={() => navigate("/events")}
        className="aspect-[4/3] bg-white hover:scale-[1.02]"
      />
      <Card
        title="Find Vets"
        icon="/lovable-uploads/0de28ab3-c7d0-4f1a-93ac-e975813200de.png"
        onClick={() => navigate("/find-vets")}
        className="aspect-[4/3] bg-white hover:scale-[1.02]"
      />
      <Card
        title="Pet Essentials"
        icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
        onClick={onEssentialsClick}
        className="aspect-[4/3] bg-white hover:scale-[1.02]"
      />
      <Card
        title="Pet Grooming"
        icon="/lovable-uploads/8f3aed90-73d6-4c1e-ab8b-639261a42d22.png"
        onClick={() => navigate("/pet-grooming")}
        className="aspect-[4/3] bg-white hover:scale-[1.02]"
      />
    </div>
  );
}
