
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function GroomerAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    checkExistingSession();
  }, []);

  // Check if user is already authenticated and redirect appropriately
  const checkExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // No user session exists, stay on auth page

      // User is already authenticated, check if they have a groomer profile
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
        // Profile exists, check status and redirect accordingly
        handleProfileStatus(profile.application_status);
      } else {
        // No profile exists, redirect to onboarding
        navigate("/groomer-onboarding");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const handleProfileStatus = (status: string) => {
    switch (status) {
      case 'pending':
        navigate("/groomer-pending");
        break;
      case 'approved':
        navigate("/groomer-dashboard");
        break;
      case 'rejected':
        toast({
          title: "Application Rejected",
          description: "Your application has been rejected. Please contact support for more information.",
          variant: "destructive"
        });
        break;
      default:
        navigate("/groomer-onboarding");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          navigate("/groomer-onboarding");
          toast({
            title: "Success",
            description: "Account created successfully. Please complete your profile.",
          });
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        // After successful login, check profile status
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile, error: profileError } = await supabase
          .from("groomer_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error checking groomer profile:", profileError);
          throw profileError;
        }

        if (profile) {
          // Profile exists, check status and redirect accordingly
          handleProfileStatus(profile.application_status);
        } else {
          // No profile exists, redirect to onboarding
          navigate("/groomer-onboarding");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isSignUp ? "Create Groomer Account" : "Sign In as Groomer"}
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {isSignUp && (
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-primary hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
