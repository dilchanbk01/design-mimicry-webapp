
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/AuthButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  isScrolled?: boolean;
  selectedCity?: string | null;
  onCitySelect?: () => void;
  transparent?: boolean;
}

export function Header({ isScrolled, selectedCity, onCitySelect, transparent = false }: HeaderProps) {
  const [isOpaque, setIsOpaque] = useState(false);
  const isMobile = useIsMobile();
  
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOpaque || !transparent ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Left side with location selector - only icon */}
        <div className="flex items-center">
          {onCitySelect && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCitySelect}
              className={`text-sm font-medium flex items-center ${
                isOpaque || !transparent ? "text-gray-600" : "text-white"
              }`}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png"
              alt="Petsu"
              className="h-10"
              width="40"
              height="40"
            />
          </Link>
        </div>

        {/* Right side with auth button */}
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className={`h-6 w-6 ${isOpaque || !transparent ? "text-gray-600" : "text-white"}`} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
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
                      <span className="font-bold text-lg">Petsu</span>
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
                    <AuthButton provider="google" className="w-full" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <AuthButton
              provider="google"
              className={!isOpaque && transparent ? "text-white border-white hover:bg-white/10" : ""}
            />
          )}
        </div>
      </div>
    </header>
  );
}
