
import { Search, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EventsHeaderProps {
  isSearchOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export function EventsHeader({ 
  isSearchOpen, 
  searchQuery, 
  setSearchQuery, 
  setIsSearchOpen 
}: EventsHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 bg-transparent z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <img 
            src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
            alt="Petsu"
            className="h-12 cursor-pointer"
            onClick={() => navigate('/')}
          />

          <div className="flex items-center gap-4">
            {isSearchOpen ? (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 rounded-full bg-white shadow-lg w-64"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Search 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/profile')}
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
