
import { Card } from "@/components/Card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServicesGridProps {
  onEssentialsClick: () => void;
}

export function ServicesGrid({ onEssentialsClick }: ServicesGridProps) {
  const navigate = useNavigate();
  const [isVetNotifyOpen, setIsVetNotifyOpen] = useState(false);

  const handleEssentialsClick = () => {
    window.location.href = "https://supertails.com/";
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          onClick={() => setIsVetNotifyOpen(true)}
          titleClassName="text-base md:text-xl"
          className="aspect-square bg-white hover:scale-[1.02]"
        />
        <Card
          title="Pet Essentials"
          icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
          onClick={handleEssentialsClick}
          titleClassName="text-base md:text-xl"
          className="aspect-square bg-white hover:scale-[1.02]"
        />
      </div>

      <Dialog open={isVetNotifyOpen} onOpenChange={setIsVetNotifyOpen}>
        <DialogContent>
          <DialogTitle>Coming Soon!</DialogTitle>
          <DialogDescription>
            Our veterinary services will be available soon. We'll notify you when they're ready!
          </DialogDescription>
          <div className="mt-6">
            <Button onClick={() => setIsVetNotifyOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
