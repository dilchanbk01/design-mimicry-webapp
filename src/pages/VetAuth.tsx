
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope } from "lucide-react";

export default function VetAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if the user is a vet
      const { data: vetProfile } = await supabase
        .from("vet_profiles")
        .select("application_status")
        .single();

      if (!vetProfile) {
        throw new Error("No vet profile found");
      }

      if (vetProfile.application_status === "pending") {
        toast({
          title: "Application Pending",
          description: "Your application is still under review.",
        });
      } else if (vetProfile.application_status === "rejected") {
        toast({
          title: "Application Rejected",
          description: "Your application has been rejected. Please contact support.",
          variant: "destructive",
        });
      } else {
        navigate("/vet-dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00D26A] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Stethoscope className="h-12 w-12 text-[#00D26A]" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-6">
          Vet Partner Login
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/vet-onboarding")}
            className="text-[#00D26A] hover:underline"
          >
            Apply as a Vet Partner
          </button>
        </p>
      </div>
    </div>
  );
}
