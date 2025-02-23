
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export default function VetAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Check if user has a vet profile
      const { data: vetProfile, error: profileError } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (profileError) throw profileError;

      if (!vetProfile) {
        throw new Error("No vet profile found");
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      
      navigate("/vet-dashboard");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-primary py-12 px-4">
      <div className="container max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8">
            Vet Partner Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
