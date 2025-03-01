
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignInForm({ auth }) {
  const { state, updateField, handleSignIn, handleForgotPassword } = auth;

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-signin">Email</Label>
        <Input
          id="email-signin"
          type="email"
          value={state.email}
          onChange={(e) => updateField("email", e.target.value)}
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
          value={state.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={state.loading}
      >
        {state.loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
