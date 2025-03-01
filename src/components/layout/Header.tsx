
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  isScrolled?: boolean;
  selectedCity?: string | null;
  onCitySelect?: () => void;
  transparent?: boolean;
}

export function Header({ isScrolled, selectedCity, onCitySelect, transparent = false }: HeaderProps) {
  const [isOpaque, setIsOpaque] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    if (isScrolled !== undefined) {
      setIsOpaque(isScrolled);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsOpaque(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuthStatus();
  }, []);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? "/profile" : "/auth");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOpaque || !transparent ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Left side with menu icon */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${isOpaque || !transparent ? "text-gray-600" : "text-white"}`}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <Link to="/" className="flex items-center gap-2">
                    <img
                      src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png"
                      alt="Petsu"
                      className="h-8"
                      width="32"
                      height="32"
                    />
                  </Link>
                </div>
                <nav className="flex-grow p-4">
                  <ul className="space-y-4">
                    <li>
                      <Link
                        to="/"
                        className="block py-2 px-4 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/events"
                        className="block py-2 px-4 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Events
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/find-vets"
                        className="block py-2 px-4 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Find Vets
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/pet-grooming"
                        className="block py-2 px-4 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Pet Grooming
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/blog"
                        className="block py-2 px-4 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Blog
                      </Link>
                    </li>
                  </ul>
                </nav>
                <div className="p-4 border-t">
                  {isLoggedIn ? (
                    <Link to="/profile" className="block w-full py-2 px-4 text-center bg-primary text-white rounded-md">
                      My Profile
                    </Link>
                  ) : (
                    <Link to="/auth" className="block w-full py-2 px-4 text-center bg-primary text-white rounded-md">
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right side with profile icon */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${!isOpaque && transparent ? "text-white hover:bg-white/10" : "text-gray-600"}`}
            onClick={handleProfileClick}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
