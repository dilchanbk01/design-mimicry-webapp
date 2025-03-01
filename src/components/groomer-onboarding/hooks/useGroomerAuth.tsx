
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useGroomerAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuth = async () => {
    try {
      setCheckingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User is not authenticated, redirect to auth page
        toast({
          title: "Authentication Required",
          description: "Please sign up or sign in before completing your groomer profile.",
        });
        navigate("/groomer-auth");
        return;
      }

      setIsAuthenticated(true);

      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Profile exists, redirect based on status
        switch (existingProfile.application_status) {
          case 'pending':
            toast({
              title: "Application Already Submitted",
              description: "You have already submitted an application.",
            });
            navigate("/groomer-pending");
            break;
          case 'approved':
            navigate("/groomer-dashboard");
            break;
          case 'rejected':
            toast({
              title: "Application Rejected",
              description: "Your previous application was rejected. Please contact support.",
              variant: "destructive"
            });
            break;
          default:
            // Allow them to stay on onboarding page
            break;
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    checkingAuth
  };
}
