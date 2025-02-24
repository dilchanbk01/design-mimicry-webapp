
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SPECIALIZATIONS = [
  "Dog Grooming",
  "Cat Grooming",
  "Pet Spa",
  "Mobile Grooming",
  "Show Grooming",
  "Natural Grooming"
];

export default function GroomerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    salonName: "",
    experienceYears: "",
    specializations: [] as string[],
    address: "",
    contactNumber: "",
    bio: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/groomer-auth");
        return;
      }

      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (existingProfile) {
        toast({
          title: "Application Already Submitted",
          description: "You have already submitted an application.",
        });
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/groomer-auth");
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }} = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/groomer-auth");
        return;
      }

      const { error } = await supabase.from("groomer_profiles").insert({
        user_id: user.id,
        salon_name: formData.salonName,
        experience_years: parseInt(formData.experienceYears),
        specializations: formData.specializations,
        address: formData.address,
        contact_number: formData.contactNumber,
        bio: formData.bio
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      navigate("/");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Join as a Grooming Partner
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="salonName">Salon Name</Label>
              <Input
                id="salonName"
                value={formData.salonName}
                onChange={(e) => setFormData(prev => ({ ...prev, salonName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map((specialization) => (
                  <Button
                    key={specialization}
                    type="button"
                    variant={formData.specializations.includes(specialization) ? "default" : "outline"}
                    onClick={() => handleSpecializationToggle(specialization)}
                    className="justify-start"
                  >
                    {specialization}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about your grooming experience and services..."
                className="h-32"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
