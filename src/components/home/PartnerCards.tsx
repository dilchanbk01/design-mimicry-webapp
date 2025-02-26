
import { Button } from "@/components/ui/button";

interface PartnerCardsProps {
  onVetPartnerClick: () => void;
  onGroomerPartnerClick: () => void;
}

export function PartnerCards({ onVetPartnerClick, onGroomerPartnerClick }: PartnerCardsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-accent rounded-3xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Are you a veterinarian?</h2>
        <p className="text-white/90 mb-4">Join our network of professional vets and connect with pet owners.</p>
        <Button
          onClick={onVetPartnerClick}
          className="bg-white text-accent hover:bg-white/90 font-semibold"
        >
          Join as a Vet Partner
        </Button>
      </div>

      <div className="bg-accent rounded-3xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Are you a professional groomer?</h2>
        <p className="text-white/90 mb-4">Join our network of pet groomers and grow your business.</p>
        <Button
          onClick={onGroomerPartnerClick}
          className="bg-white text-accent hover:bg-white/90 font-semibold"
        >
          Join as a Groomer Partner
        </Button>
      </div>
    </div>
  );
}
