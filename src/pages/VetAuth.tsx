import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VetAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  const checkEmailExists = async (email: string) => {
    setEmailCheckLoading(true);
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('email', email);
      
      if (error) {
        console.error("Error checking email:", error);
        return false;
      }
      
      return count ? count > 0 : false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast({
          title: "Email already in use",
          description: "This email is already registered. Please sign in or use a different email.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });

      if (data.user) {
        navigate("/vet-onboarding");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: vetProfile, error: profileError } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      toast({
        title: "Welcome back",
        description: "You have successfully signed in.",
      });

      if (!vetProfile) {
        navigate("/vet-onboarding");
      } else {
        navigate("/find-vets");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Veterinarian Portal</h1>
          <p className="text-gray-500">
            Sign in to your account or register as a veterinarian
          </p>
        </div>

        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <Card>
              <form onSubmit={handleSignIn}>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          toast({
                            title: "Password Reset",
                            description: "This feature is coming soon.",
                          });
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="sign-up">
            <Card>
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Join our veterinary professional network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email-signup" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password-signup" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password-signup"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Password must be at least 6 characters
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading || emailCheckLoading}>
                    {loading || emailCheckLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
