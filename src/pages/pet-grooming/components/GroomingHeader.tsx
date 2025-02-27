
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCircle2 } from "lucide-react";

export function GroomingHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="bg-transparent absolute top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/20"
          onClick={() => navigate("/pet-grooming")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Logo - Centered */}
        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <img 
            src="/lovable-uploads/8f3aed90-73d6-4c1e-ab8b-639261a42d22.png" 
            alt="Petsu Logo" 
            className="h-14 w-auto"
          />
        </Link>

        {/* Profile Icon */}
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Link to="/profile">
            <UserCircle2 className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
