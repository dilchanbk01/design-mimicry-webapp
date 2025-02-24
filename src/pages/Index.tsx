
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";
import { User } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVetPartnerClick = () => {
    navigate("/vet-onboarding");
  };

  return (
    <div className="min-h-screen w-full bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - empty for balance */}
            <div className="w-10" />

            {/* Center - Logo */}
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />

            {/* Right side - Profile Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card
            title="Events"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={() => navigate("/events")}
            className="aspect-[4/3] bg-white hover:scale-[1.02]"
          />
          <Card
            title="Find Vets"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={() => navigate("/find-vets")}
            className="aspect-[4/3] bg-white hover:scale-[1.02]"
          />
          <Card
            title="Pet Essentials"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={() => toast({ title: "Shop coming soon!" })}
            className="aspect-[4/3] bg-white hover:scale-[1.02]"
          />
          <Card
            title="Vet Partner"
            icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
            onClick={handleVetPartnerClick}
            className="aspect-[4/3] bg-white hover:scale-[1.02]"
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
