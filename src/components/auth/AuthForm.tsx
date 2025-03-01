
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AuthButton } from "@/components/AuthButton";
import { useToast } from "@/components/ui/use-toast";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { useAuth } from "@/hooks/use-auth";

interface AuthFormProps {
  redirectPath?: string;
  onLoginSuccess?: (userId: string) => void;
  onSignUpSuccess?: (userId: string) => void;
}

export function AuthForm({
  redirectPath,
  onLoginSuccess,
  onSignUpSuccess
}: AuthFormProps) {
  const { toast } = useToast();
  const auth = useAuth({ redirectPath, onLoginSuccess, onSignUpSuccess });

  const handleTabChange = (value: string) => {
    auth.updateField("activeTab", value as "sign-in" | "sign-up");
  };

  const handleSocialAuthSuccess = () => {
    if (redirectPath) {
      localStorage.setItem("redirectAfterAuth", redirectPath);
    }
    auth.navigateAfterAuth();
  };

  return (
    <Tabs
      defaultValue="sign-in"
      value={auth.state.activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 w-full mb-4">
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="sign-in">
        <SignInForm 
          auth={auth}
        />

        <Separator className="my-6" />

        <div className="space-y-4">
          <AuthButton
            provider="google"
            onSuccess={handleSocialAuthSuccess}
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
        <SignUpForm 
          auth={auth}
        />

        <Separator className="my-6" />

        <div className="space-y-4">
          <AuthButton
            provider="google"
            onSuccess={handleSocialAuthSuccess}
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
  );
}
