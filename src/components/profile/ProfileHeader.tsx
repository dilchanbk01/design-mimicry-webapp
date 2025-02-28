
import { Link } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  userName?: string;
}

export function ProfileHeader({ userName }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="w-1/3">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span className="font-medium truncate">
                {userName || "My Profile"}
              </span>
            </div>
          </div>
          
          {/* Center logo */}
          <div className="w-1/3 flex justify-center">
            <Link to="/" className="flex items-center">
              <img
                src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png"
                alt="Petsu"
                className="h-10"
                width="40"
                height="40"
              />
            </Link>
          </div>
          
          <div className="w-1/3 flex justify-end gap-4">
            <Link 
              to="/edit-profile" 
              className="flex items-center hover:text-green-200 transition-colors"
            >
              <Settings className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center hover:text-green-200 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
