
import React from "react";
import { Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthForm } from "@/components/auth/AuthForm";

export default function VetAuth() {
  const auth = useAuth();

  const handleVetSignUpSuccess = async (userId: string) => {
    auth.navigateAfterAuth("/vet-onboarding");
  };

  const handleVetSignInSuccess = async (userId: string) => {
    try {
      const { data: vetProfile, error } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!vetProfile) {
        auth.navigateAfterAuth("/vet-onboarding");
      } else {
        auth.navigateAfterAuth("/find-vets");
      }
    } catch (error) {
      console.error("Error checking vet profile:", error);
      auth.navigateAfterAuth("/vet-onboarding");
    }
  };

  return (
    <AuthContainer 
      title="Veterinarian Portal"
      backgroundColor="bg-gray-50"
      showBackButton={false}
    >
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
          <Stethoscope className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Veterinarian Portal</h1>
        <p className="text-gray-500">
          Sign in to your account or register as a veterinarian
        </p>
      </div>

      <AuthForm
        onSignUpSuccess={handleVetSignUpSuccess}
        onLoginSuccess={handleVetSignInSuccess}
      />

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
    </AuthContainer>
  );
}
