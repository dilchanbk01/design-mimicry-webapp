
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignInFormProps {
  auth: any;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export function SignInForm({ auth, isLoading, setIsLoading }: SignInFormProps) {
  const { state, updateField, handleSignIn } = auth;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setIsLoading) setIsLoading(true);
    await handleSignIn(e);
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={state.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          placeholder="Enter your email"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={state.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
