
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthForm } from "@/components/auth/AuthForm";

export default function GroomerAuth() {
  const { toast } = useToast();
  const auth = useAuth();
  
  useEffect(() => {
    checkExistingGroomerSession();
  }, []);

  const checkExistingGroomerSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // No user session exists, stay on auth page

      const { data: profile, error } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking groomer profile:", error);
        return;
      }

      if (profile) {
        handleProfileStatus(profile.application_status);
      } else {
        auth.navigateAfterAuth("/groomer-onboarding");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const handleProfileStatus = (status: string) => {
    switch (status) {
      case 'pending':
        auth.navigateAfterAuth("/groomer-pending");
        break;
      case 'approved':
        auth.navigateAfterAuth("/groomer-dashboard");
        break;
      case 'rejected':
        toast({
          title: "Application Rejected",
          description: "Your application has been rejected. Please contact care@petsu.in for more information.",
          variant: "destructive"
        });
        break;
      default:
        auth.navigateAfterAuth("/groomer-onboarding");
    }
  };

  const handleGroomerSignUpSuccess = async (userId: string) => {
    auth.navigateAfterAuth("/groomer-onboarding");
  };

  const handleGroomerSignInSuccess = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking groomer profile:", error);
        return;
      }

      if (profile) {
        handleProfileStatus(profile.application_status);
      } else {
        auth.navigateAfterAuth("/groomer-onboarding");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  return (
    <AuthContainer 
      title="Groomer Authentication"
      backgroundColor="bg-primary"
    >
      <AuthForm
        onSignUpSuccess={handleGroomerSignUpSuccess}
        onLoginSuccess={handleGroomerSignInSuccess}
      />
    </AuthContainer>
  );
}
