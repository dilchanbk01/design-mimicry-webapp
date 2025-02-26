
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroomerFormFields } from "@/components/groomer-onboarding/GroomerFormFields";
import { GroomerFormData, initialFormData } from "@/components/groomer-onboarding/schema";

export default function GroomerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GroomerFormData>(initialFormData);

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

  const handleFormDataChange = (updates: Partial<GroomerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleImageChange = (file: File) => {
    setFormData(prev => ({
      ...prev,
      profileImage: file
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

      let profileImageUrl = null;

      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('groomer-profiles')
          .upload(filePath, formData.profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('groomer-profiles')
          .getPublicUrl(filePath);

        profileImageUrl = publicUrl;
      }

      const { error } = await supabase.from("groomer_profiles").insert({
        user_id: user.id,
        salon_name: formData.salonName,
        experience_years: parseInt(formData.experienceYears),
        specializations: formData.specializations,
        address: formData.address,
        contact_number: formData.contactNumber,
        bio: formData.bio,
        profile_image_url: profileImageUrl,
        provides_home_service: formData.providesHomeService,
        provides_salon_service: formData.providesSalonService
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
            <GroomerFormFields
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSpecializationToggle={handleSpecializationToggle}
              onImageChange={handleImageChange}
            />
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
