
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  loading: boolean;
  emailCheckLoading: boolean;
}

interface UseAuthOptions {
  redirectPath?: string;
  onLoginSuccess?: (userId: string) => void;
  onSignUpSuccess?: (userId: string) => void;
}

export function useAuth(options: UseAuthOptions = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<AuthState>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    loading: false,
    emailCheckLoading: false,
  });

  const updateField = (field: keyof AuthState, value: string | boolean) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const checkExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigateAfterAuth(user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  };

  const navigateAfterAuth = (userId: string = "") => {
    if (options.redirectPath) {
      navigate(options.redirectPath);
      return;
    }

    const redirectPath = localStorage.getItem("redirectAfterAuth");
    if (redirectPath) {
      localStorage.removeItem("redirectAfterAuth");
      navigate(redirectPath);
    } else {
      navigate("/");
    }

    if (userId) {
      if (state.loading && options.onLoginSuccess) {
        options.onLoginSuccess(userId);
      } else if (options.onSignUpSuccess) {
        options.onSignUpSuccess(userId);
      }
    }
  };

  const checkEmailExists = async (email: string) => {
    updateField("emailCheckLoading", true);
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('email', email);
      
      return count ? count > 0 : false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    } finally {
      updateField("emailCheckLoading", false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    updateField("loading", true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: state.email,
        password: state.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigateAfterAuth(data.user?.id);
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateField("loading", false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    updateField("loading", true);

    if (state.password !== state.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      updateField("loading", false);
      return;
    }

    try {
      const emailExists = await checkEmailExists(state.email);
      if (emailExists) {
        toast({
          title: "Email already in use",
          description: "This email is already registered. Please sign in or use a different email.",
          variant: "destructive",
        });
        updateField("loading", false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: state.email,
        password: state.password,
        options: {
          data: {
            full_name: state.fullName,
            phone_number: state.phoneNumber,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });

      navigateAfterAuth(data.user?.id);
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateField("loading", false);
    }
  };

  const handleForgotPassword = async () => {
    if (!state.email) {
      toast({
        title: "Email required",
        description: "Please enter your email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    updateField("loading", true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
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
      updateField("loading", false);
    }
  };

  return {
    state,
    updateField,
    checkExistingSession,
    navigateAfterAuth,
    handleSignIn,
    handleSignUp,
    handleForgotPassword,
  };
}
