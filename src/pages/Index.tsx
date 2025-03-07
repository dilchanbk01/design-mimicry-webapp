
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { PartnerCards } from "@/components/home/PartnerCards";
import { CitySelectionDialog } from "@/components/home/CitySelectionDialog";
import { NotifyDialog } from "@/components/home/NotifyDialog";

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
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > lastScrollY && currentScrollY > 50);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
          <div className="space-y-12">
            <ServicesGrid onEssentialsClick={() => setIsNotifyDialogOpen(true)} />
            <PartnerCards
              onVetPartnerClick={handleVetPartnerClick}
              onGroomerPartnerClick={handleGroomerPartnerClick}
            />
          </div>
        </div>
      </main>

      <Footer />

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
