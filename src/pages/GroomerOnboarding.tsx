
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroomerFormFields } from "@/components/groomer-onboarding/GroomerFormFields";
import { GroomerFormData, initialFormData } from "@/components/groomer-onboarding/schema";

export default function GroomerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GroomerFormData>(initialFormData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setCheckingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User is not authenticated, redirect to auth page
        navigate("/groomer-auth");
        return;
      }

      setIsAuthenticated(true);

      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Profile exists, redirect based on status
        switch (existingProfile.application_status) {
          case 'pending':
            toast({
              title: "Application Already Submitted",
              description: "You have already submitted an application.",
            });
            navigate("/groomer-pending");
            break;
          case 'approved':
            navigate("/groomer-dashboard");
            break;
          case 'rejected':
            toast({
              title: "Application Rejected",
              description: "Your previous application was rejected. Please contact support.",
              variant: "destructive"
            });
            break;
          default:
            // Allow them to stay on onboarding page
            break;
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setCheckingAuth(false);
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

      // Validate required fields
      if (!formData.salonName || !formData.experienceYears || formData.specializations.length === 0 ||
          !formData.streetAddress || !formData.city || !formData.pincode || !formData.contactNumber) {
        throw new Error("Please fill out all required fields");
      }

      let profileImageUrl = null;

      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('groomer-profiles')
          .upload(filePath, formData.profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('groomer-profiles')
          .getPublicUrl(filePath);

        profileImageUrl = publicUrl;
      }

      // Construct full address from components
      const fullAddress = [
        formData.streetAddress,
        formData.city,
        formData.pincode
      ].filter(Boolean).join(", ");

      console.log("Submitting groomer application with data:", {
        user_id: user.id,
        salon_name: formData.salonName,
        experience_years: parseInt(formData.experienceYears),
        specializations: formData.specializations,
        address: fullAddress,
        contact_number: formData.contactNumber,
        bio: formData.bio,
        profile_image_url: profileImageUrl,
        provides_home_service: formData.providesHomeService,
        provides_salon_service: formData.providesSalonService,
        application_status: 'pending'
      });

      const { error, data } = await supabase.from("groomer_profiles").insert({
        user_id: user.id,
        salon_name: formData.salonName,
        experience_years: parseInt(formData.experienceYears),
        specializations: formData.specializations,
        address: fullAddress,
        contact_number: formData.contactNumber,
        bio: formData.bio,
        profile_image_url: profileImageUrl,
        provides_home_service: formData.providesHomeService,
        provides_salon_service: formData.providesSalonService,
        application_status: 'pending'
      }).select();

      if (error) {
        console.error("Submission error:", error);
        throw error;
      }

      console.log("Groomer application submitted successfully:", data);

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      navigate("/groomer-pending");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will be redirected in the checkAuth function
  }

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
