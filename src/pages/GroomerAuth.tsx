
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors } from "lucide-react";

export default function GroomerAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  // Check if user is already authenticated and redirect appropriately
  const checkExistingSession = async () => {
    try {
      setCheckingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAuth(false);
        return; // No user session exists, stay on auth page
      }

      // User is already authenticated, check if they have a groomer profile
      const { data: profile, error } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking groomer profile:", error);
        setCheckingAuth(false);
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
      setCheckingAuth(false);
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-primary/10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/10 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Scissors className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create Groomer Account" : "Sign In as Groomer"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Sign up to offer your grooming services"
              : "Welcome back! Sign in to manage your grooming business"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
