
import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleVetPartnerClick = () => {
    navigate("/vet-onboarding");
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification Registered",
      description: "We'll notify you when Pet Essentials launches!",
    });
    setEmail("");
    setIsNotifyDialogOpen(false);
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
              icon="/lovable-uploads/3ff4430d-913b-49ff-9efc-06a1dda0fa4c.png"
              onClick={() => navigate("/events")}
              className="aspect-square bg-white hover:scale-[1.02]"
            />
            <Card
              title="Find Vets"
              icon="/lovable-uploads/0de28ab3-c7d0-4f1a-93ac-e975813200de.png"
              onClick={() => navigate("/find-vets")}
              className="aspect-square bg-white hover:scale-[1.02]"
            />
          </div>

          {/* Pet Essentials Card */}
          <Card
            title="Pet Essentials"
            icon="/lovable-uploads/2737b2dd-8bd8-496f-8a36-6329dc70fe41.png"
            onClick={() => setIsNotifyDialogOpen(true)}
            className="bg-white hover:scale-[1.02] aspect-[2/1]"
          />

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

      {/* Notify Me Dialog */}
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Get Notified</DialogTitle>
            <DialogDescription>
              Enter your email to be notified when Pet Essentials launches.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotifySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Notify Me
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
