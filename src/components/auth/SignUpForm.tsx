
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignUpForm({ auth }) {
  const { state, updateField, handleSignUp } = auth;

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input
          id="full-name"
          type="text"
          value={state.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          required
          placeholder="Enter your full name"
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
          minLength={6}
        />
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
          minLength={6}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={state.loading || state.emailCheckLoading}
      >
        {state.loading || state.emailCheckLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
