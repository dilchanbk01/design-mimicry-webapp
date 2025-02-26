
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { MainMenu } from "@/components/profile/MainMenu";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primary/10 flex items-center justify-center">
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
      case "grooming":
        return <div>Placeholder for Grooming Bookings</div>;
      case "help":
        return <HelpSupportSection />;
      case "about":
        return <AboutSection />;
      default:
        return <MainMenu onSignOut={handleSignOut} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary/10">
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
              <div className="w-6">{/* Spacer */}</div>
            )}
            
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8"
            />
            
            {activeTab !== "profile" && (
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-16 pb-20 max-w-lg">
        {activeTab === "profile" && profile && (
          <ProfileHeader fullName={profile.full_name} />
        )}
        {renderContent()}
      </main>
    </div>
  );
}
