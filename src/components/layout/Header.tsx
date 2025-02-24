
import { Button } from "@/components/ui/button";
import { MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  isScrolled: boolean;
  selectedCity: string | null;
  onCitySelect: () => void;
}

export function Header({ isScrolled, selectedCity, onCitySelect }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? '-translate-y-full' : 'translate-y-0'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 gap-2"
            onClick={onCitySelect}
          >
            <MapPin className="h-5 w-5" />
            {selectedCity || "Select City"}
          </Button>
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
  );
}
