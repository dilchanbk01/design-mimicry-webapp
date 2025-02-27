
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GroomerHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="absolute top-0 left-0 right-0 bg-transparent z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-600/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <img 
            src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
            alt="Petsu"
            className="h-8 sm:h-10 cursor-pointer"
            onClick={() => navigate('/')}
          />

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-600/20"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
