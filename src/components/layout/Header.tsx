
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface HeaderProps {
  isScrolled?: boolean;
  selectedCity?: string | null;
  onCitySelect?: () => void;
}

export function Header({ isScrolled, selectedCity, onCitySelect }: HeaderProps) {
  const [notifyOpen, setNotifyOpen] = useState(false);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
            alt="Petsu Logo" 
            className="h-12 mt-4"
          />
          <h2 className="mt-2 text-xl font-playfair text-accent">Making Pet Care Effortless</h2>
        </div>
        {onCitySelect && (
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              onClick={onCitySelect}
              className={`flex items-center gap-2 text-sm ${
                isScrolled ? "text-accent" : "text-white"
              }`}
            >
              {selectedCity || "Select your city"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
