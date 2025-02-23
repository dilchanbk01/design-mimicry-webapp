
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVetPartnerClick = () => {
    toast({
      title: "Coming Soon",
      description: "The vet partner registration will be available soon!",
    });
  };

  return (
    <div className="min-h-screen w-full bg-primary">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center gap-16">
        {/* Logo */}
        <div className="w-full max-w-md">
          <h1 className="text-6xl font-bold text-center text-secondary filter drop-shadow-md">
            Petsu
          </h1>
        </div>

        {/* Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
          <Card
            title="Events"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={() => navigate("/events")}
          />
          <Card
            title="Find Vets"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={() => toast({ title: "Vet finder coming soon!" })}
          />
          <Card
            title="Pet Essentials"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={() => toast({ title: "Shop coming soon!" })}
          />
        </div>

        {/* Vet Partner Section */}
        <div className="w-full max-w-2xl bg-accent rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">Are you a veterinarian?</h2>
          <p className="mb-6 text-gray-200">
            Join our network of professional vets and connect with pet owners.
          </p>
          <Button
            onClick={handleVetPartnerClick}
            className="bg-white text-accent hover:bg-gray-100 transition-colors"
          >
            Join as a Vet Partner
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
