
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AuthButton } from "@/components/AuthButton";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigateAfterAuth();
    }
  };

  const navigateAfterAuth = () => {
    const redirectPath = localStorage.getItem("redirectAfterAuth");
    if (redirectPath) {
      localStorage.removeItem("redirectAfterAuth");
      navigate(redirectPath);
    } else {
      navigate("/");
    }
  };

  const checkEmailExists = async (email: string) => {
    setEmailCheckLoading(true);
    try {
      // Use a direct query instead of RPC to avoid TypeScript errors
      const { data, error } = await supabase.auth.admin.listUsers({
        filters: {
          email: email
        }
      }).catch(() => {
        // Fallback if admin API fails (likely due to permission)
        return supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('id', supabase.auth.admin.listUsers)
          .limit(1);
      });
      
      if (error) {
        console.error("Error checking email:", error);
        return false;
      }
      
      // For admin API, check users array length
      if (data && Array.isArray(data.users)) {
        return data.users.length > 0;
      }
      
      // For fallback query, check if data exists and has entries
      return data && (Array.isArray(data) ? data.length > 0 : false);
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigateAfterAuth();
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists
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

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });

      navigateAfterAuth();
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Back button */}
      <div className="container p-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-green-700 hover:bg-green-100 hover:text-green-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img 
            src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
            alt="Petsu Logo" 
            className="h-16 mb-4"
          />
          <h1 className="text-2xl font-bold text-green-800">
            {activeTab === "sign-in" ? "Welcome Back!" : "Create Account"}
          </h1>
        </div>

        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
          <Tabs
            defaultValue="sign-in"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "sign-in" | "sign-up")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password-signin">Password</Label>
                    <Button
                      variant="link"
                      className="text-xs text-green-600 p-0 h-auto"
                      type="button"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password-signin"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-4">
                <AuthButton
                  provider="google"
                  onSuccess={navigateAfterAuth}
                  onError={(error) =>
                    toast({
                      title: "Authentication failed",
                      description: error,
                      variant: "destructive",
                    })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="sign-up">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || emailCheckLoading}
                >
                  {loading || emailCheckLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-4">
                <AuthButton
                  provider="google"
                  onSuccess={navigateAfterAuth}
                  onError={(error) =>
                    toast({
                      title: "Authentication failed",
                      description: error,
                      variant: "destructive",
                    })
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
