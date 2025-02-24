
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
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
            <div className="w-10" />
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Square Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card
              title="Events"
              icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
              onClick={() => navigate("/events")}
              className="aspect-square bg-white hover:scale-[1.02]"
            />
            <Card
              title="Find Vets"
              icon="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png"
              onClick={() => navigate("/find-vets")}
              className="aspect-square bg-white hover:scale-[1.02]"
            />
          </div>

          {/* Pet Essentials Rectangle Card */}
          <button
            onClick={() => toast({ title: "Shop coming soon!" })}
            className="w-full bg-white rounded-3xl p-6 shadow-lg transition-all duration-300 ease-out hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-accent">Pet Essentials</h3>
              <img 
                src="/lovable-uploads/01f1af17-4a11-4809-9674-01e898a01385.png" 
                alt="Pet Essentials" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </button>

          {/* Vet Partner Rectangle Card */}
          <div className="bg-accent rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Are you a veterinarian?</h2>
            <p className="text-white/90 mb-6">Join our network of professional vets and connect with pet owners.</p>
            <Button
              onClick={handleVetPartnerClick}
              className="bg-white text-accent hover:bg-white/90 font-semibold"
            >
              Join as a Vet Partner
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
