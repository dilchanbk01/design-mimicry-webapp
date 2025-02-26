
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GroomingHeader() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <img 
            src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
            alt="Petsu"
            className="h-8 cursor-pointer"
            onClick={() => navigate('/')}
          />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>
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
      </div>
    </header>
  );
}
