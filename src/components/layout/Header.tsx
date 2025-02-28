
import { Button } from "@/components/ui/button";
import { MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface HeaderProps {
  isScrolled: boolean;
  selectedCity: string | null;
  onCitySelect: () => void;
}

export function Header({ isScrolled, selectedCity, onCitySelect }: HeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            width="48"
            height="48"
            onClick={() => navigate('/')}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 gap-2"
            onClick={() => navigate(user ? '/profile' : '/auth')}
          >
            <User className="h-5 w-5" />
            {!user && "Sign In"}
          </Button>
        </div>
      </div>
    </header>
  );
}
