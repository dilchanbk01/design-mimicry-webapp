
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope } from "lucide-react";

export default function VetOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    licenseNumber: "",
    yearsOfExperience: "",
    specializations: "",
    address: "",
    contactNumber: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create vet profile
        const { error: profileError } = await supabase.from("vet_profiles").insert({
          user_id: authData.user.id,
          clinic_name: formData.clinicName,
          license_number: formData.licenseNumber,
          years_of_experience: parseInt(formData.yearsOfExperience),
          specializations: formData.specializations.split(",").map(s => s.trim()),
          address: formData.address,
          contact_number: formData.contactNumber,
          bio: formData.bio,
          application_status: "pending"
        });

        if (profileError) throw profileError;

        toast({
          title: "Application Submitted",
          description: "Please check your email to verify your account.",
        });
        navigate("/vet-auth");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-primary py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Stethoscope className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-8">
            Vet Partner Application
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
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
                minLength={6}
              />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Professional Information</h2>
              <Input
                name="clinicName"
                placeholder="Clinic Name"
                value={formData.clinicName}
                onChange={handleChange}
                required
              />
              <Input
                name="licenseNumber"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
              <Input
                name="yearsOfExperience"
                type="number"
                placeholder="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                required
                min="0"
              />
              <Input
                name="specializations"
                placeholder="Specializations (comma-separated)"
                value={formData.specializations}
                onChange={handleChange}
                required
              />
              <Input
                name="address"
                placeholder="Clinic Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <Input
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
              <Textarea
                name="bio"
                placeholder="Professional Bio"
                value={formData.bio}
                onChange={handleChange}
                className="h-32"
              />
            </div>

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
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
