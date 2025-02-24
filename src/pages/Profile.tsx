
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  ChevronLeft 
} from "lucide-react";
import { TicketsSection } from "@/components/profile/TicketsSection";
import { EventsSection } from "@/components/profile/EventsSection";
import { HelpSupportSection } from "@/components/profile/HelpSupportSection";
import { AboutSection } from "@/components/profile/AboutSection";

interface UserProfile {
  email: string;
  full_name: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const activeTab = searchParams.get("tab") || "profile";

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
      tab: "tickets",
    },
    {
      icon: Calendar,
      title: "Your Events",
      subtitle: "Manage your organized events",
      tab: "events",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get assistance and FAQs",
      tab: "help",
    },
    {
      icon: Info,
      title: "About Us",
      subtitle: "Learn more about Petsu",
      tab: "about",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "tickets":
        return <TicketsSection />;
      case "events":
        return <EventsSection />;
      case "help":
        return <HelpSupportSection />;
      case "about":
        return <AboutSection />;
      default:
        return (
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(`/profile?tab=${item.tab}`)}
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {activeTab !== "profile" ? (
              <button
                onClick={() => navigate("/profile")}
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : (
              <div className="w-6" /> /* Spacer */
            )}
            
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8"
            />
            
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-16 pb-20 max-w-lg">
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <User className="h-8 w-8" />
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                Hey{profile?.full_name ? `, ${profile.full_name}` : ''}!
              </h1>
              <button 
                onClick={() => navigate("/profile/edit")}
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}
