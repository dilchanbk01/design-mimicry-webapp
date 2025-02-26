
import { Card } from "@/components/Card";
import { useNavigate } from "react-router-dom";

interface ServicesGridProps {
  onEssentialsClick: () => void;
  onFindVetsClick: () => void;
}

export function ServicesGrid({ onEssentialsClick, onFindVetsClick }: ServicesGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        title="Events"
        icon="/lovable-uploads/3ff4430d-913b-49ff-9efc-06a1dda0fa4c.png"
        onClick={() => navigate("/events")}
        titleClassName="text-base md:text-xl"
        className="aspect-square bg-white hover:scale-[1.02]"
      />
      <Card
        title="Pet Grooming"
        icon="/lovable-uploads/8f3aed90-73d6-4c1e-ab8b-639261a42d22.png"
        onClick={() => navigate("/pet-grooming")}
        titleClassName="text-base md:text-xl"
        className="aspect-square bg-white hover:scale-[1.02]"
      />
      <Card
        title="Find Vets"
        icon="/lovable-uploads/0de28ab3-c7d0-4f1a-93ac-e975813200de.png"
        onClick={onFindVetsClick}
        titleClassName="text-base md:text-xl"
        className="aspect-square bg-white hover:scale-[1.02] h-[320px]"
      />
      <Card
        title="Pet Essentials"
        icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
        onClick={onEssentialsClick}
        titleClassName="text-base md:text-xl"
        className="aspect-square bg-white hover:scale-[1.02] h-[320px]"
      />
    </div>
  );
}
