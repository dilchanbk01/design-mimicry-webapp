
import { useEffect } from "react";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";

export default function Auth() {
  const auth = useAuth();

  useEffect(() => {
    auth.checkExistingSession();
  }, []);

  return (
    <AuthContainer 
      title={auth.state.activeTab === "sign-in" ? "Welcome Back!" : "Create Account"}
      logoSrc="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png"
    >
      <AuthForm />
    </AuthContainer>
  );
}
