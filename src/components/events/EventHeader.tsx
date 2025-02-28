
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export function EventHeader() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuthStatus();
  }, []);

  return (
    <header className="bg-transparent py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex items-center text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png"
              alt="Petsu"
              className="h-8"
              width="32"
              height="32"
            />
          </Link>

          <Link to={isLoggedIn ? "/profile" : "/auth"} className="flex items-center text-white">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
