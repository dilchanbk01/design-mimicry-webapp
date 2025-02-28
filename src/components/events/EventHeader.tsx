
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
    <header className="bg-white shadow-sm py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
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

          {isLoggedIn ? (
            <Link to="/profile" className="flex items-center text-gray-600">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-800">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
