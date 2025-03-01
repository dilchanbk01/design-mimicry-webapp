
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignUpFormProps {
  auth: any;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  isGroomerAuth?: boolean;
}

export function SignUpForm({ auth, isLoading, setIsLoading, isGroomerAuth = false }: SignUpFormProps) {
  const { state, updateField, handleSignUp } = auth;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setIsLoading) setIsLoading(true);
    
    // Basic client-side validation
    if (state.password !== state.confirmPassword) {
      auth.updateField("error", "Passwords do not match");
      if (setIsLoading) setIsLoading(false);
      return;
    }
    
    // Ensure password meets requirements
    const hasLowercase = /[a-z]/.test(state.password);
    const hasUppercase = /[A-Z]/.test(state.password);
    const hasNumber = /[0-9]/.test(state.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(state.password);
    
    if (!(hasLowercase && hasUppercase && hasNumber && hasSpecial)) {
      auth.updateField("error", "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character");
      if (setIsLoading) setIsLoading(false);
      return;
    }
    
    await handleSignUp(e);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input
          id="full-name"
          type="text"
          value={state.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          required
          placeholder="Enter your full name"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input
          id="email-signup"
          type="email"
          value={state.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          placeholder="Enter your email"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone-number">Phone Number</Label>
        <Input
          id="phone-number"
          type="tel"
          value={state.phoneNumber}
          onChange={(e) => updateField("phoneNumber", e.target.value)}
          placeholder="Enter your phone number (optional)"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-signup">Password</Label>
        <Input
          id="password-signup"
          type="password"
          value={state.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
          placeholder="Create a password"
          minLength={8}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={state.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          required
          placeholder="Confirm your password"
          minLength={8}
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : isGroomerAuth ? "Create Groomer Account" : "Create Account"}
      </Button>
    </form>
  );
}
