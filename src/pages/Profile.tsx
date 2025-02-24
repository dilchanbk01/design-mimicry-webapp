
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { 
  Ticket, 
  Calendar, 
  User, 
  HelpCircle, 
  Info,
  ChevronRight,
  LogOut 
} from "lucide-react";

interface UserProfile {
  email: string;
  full_name: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setProfile({
        email: user.email || "",
        full_name: user.user_metadata?.full_name || ""
      });
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const menuItems = [
    {
      icon: Ticket,
      title: "Your Tickets",
      subtitle: "View your booked events",
      onClick: () => navigate("/profile?tab=tickets"),
    },
    {
      icon: Calendar,
      title: "Your Events",
      subtitle: "Manage your organized events",
      onClick: () => navigate("/profile?tab=events"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get assistance and FAQs",
      onClick: () => navigate("/help"),
    },
    {
      icon: Info,
      title: "About Us",
      subtitle: "Learn more about Petsu",
      onClick: () => navigate("/about"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8"
            />
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              className="text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-16 pb-20 max-w-lg">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <User className="h-8 w-8" />
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">Hey{profile?.full_name ? `, ${profile.full_name}` : ''}!</h1>
            <button 
              onClick={() => navigate("/profile/edit")}
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.subtitle}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Sign out
        </Button>
      </main>
    </div>
  );
}
