
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { PartnerCards } from "@/components/home/PartnerCards";
import { CitySelectionDialog } from "@/components/home/CitySelectionDialog";
import { NotifyDialog } from "@/components/home/NotifyDialog";
import { Instagram, Linkedin } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleVetPartnerClick = () => {
    navigate("/vet-onboarding");
  };

  const handleGroomerPartnerClick = () => {
    navigate("/groomer-auth");
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

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setIsCityDialogOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-primary flex flex-col">
      <Header
        isScrolled={isScrolled}
        selectedCity={selectedCity}
        onCitySelect={() => setIsCityDialogOpen(true)}
      />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">
          <ServicesGrid onEssentialsClick={() => setIsNotifyDialogOpen(true)} />
          <PartnerCards
            onVetPartnerClick={handleVetPartnerClick}
            onGroomerPartnerClick={handleGroomerPartnerClick}
          />
        </div>
      </main>

      <footer className="py-6">
        <div className="px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex space-x-6">
              <a 
                href="https://instagram.com/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-xs"
              >
                <Instagram size={16} />
                <span>Follow on Instagram</span>
              </a>
              <a 
                href="https://linkedin.com/company/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-xs"
              >
                <Linkedin size={16} />
                <span>Follow on LinkedIn</span>
              </a>
              <a 
                href="/blog" 
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-xs"
              >
                <span>Blog</span>
              </a>
            </div>

            <div className="flex space-x-4 text-xs text-white/90">
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-white/50">•</span>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-white transition-colors"
              >
                Terms & Conditions
              </button>
              <span className="text-white/50">•</span>
              <button 
                onClick={() => navigate('/cancellation-policy')}
                className="hover:text-white transition-colors"
              >
                Cancellation Policy
              </button>
            </div>

            <p className="text-[10px] text-white/70">
              © {new Date().getFullYear()} Petsu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <CitySelectionDialog
        open={isCityDialogOpen}
        onOpenChange={setIsCityDialogOpen}
        citySearch={citySearch}
        onCitySearchChange={setCitySearch}
        onCitySelect={handleCitySelect}
      />

      <NotifyDialog
        open={isNotifyDialogOpen}
        onOpenChange={setIsNotifyDialogOpen}
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleNotifySubmit}
      />
    </div>
  );
};

export default Index;
