
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
        transparent={true}
      />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-20">
          <div className="flex flex-col items-center mb-14 mt-2">
            <img
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png"
              alt="Petsu"
              className="h-50"
              width="200"
              height="200"
            />
            <h2 
              className="text-[#f8db14] mt-4 mb-6 text-[30px] font-medium"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Making Pet Care Effortless
            </h2>
          </div>
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
