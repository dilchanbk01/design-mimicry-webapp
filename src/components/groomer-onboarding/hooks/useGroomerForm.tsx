
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroomerFormData, initialFormData } from "../schema";
import { compressImage } from "@/utils/imageCompression";

export function useGroomerForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GroomerFormData>(initialFormData);

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

  const handleImageChange = async (file: File) => {
    try {
      const compressedFile = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        profileImage: compressedFile
      }));
    } catch (error) {
      console.error("Error compressing main profile image:", error);
      toast({
        title: "Error processing image",
        description: "There was a problem compressing your image. Please try again with a different image.",
        variant: "destructive"
      });
    }
  };

  const handleImagesChange = (images: (File | string)[]) => {
    setFormData(prev => ({
      ...prev,
      profileImages: images
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }} = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign up or sign in before submitting your application.",
          variant: "destructive"
        });
        navigate("/groomer-auth");
        return;
      }

      // Validate required fields
      if (!formData.salonName || !formData.experienceYears || formData.specializations.length === 0 ||
          !formData.streetAddress || !formData.city || !formData.pincode || !formData.contactNumber) {
        throw new Error("Please fill out all required fields");
      }

      let profileImageUrl = null;
      let profileImagesUrls: string[] = [];

      // Upload main profile image
      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop();
        const filePath = `${user.id}-main-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('groomer-profiles')
          .upload(filePath, formData.profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('groomer-profiles')
          .getPublicUrl(filePath);

        profileImageUrl = publicUrl;
      }

      // Upload additional images
      if (formData.profileImages && formData.profileImages.length > 0) {
        for (let i = 0; i < formData.profileImages.length; i++) {
          const image = formData.profileImages[i];
          
          // Skip if it's already a URL string
          if (typeof image === 'string') {
            profileImagesUrls.push(image);
            continue;
          }
          
          const fileExt = image.name.split('.').pop();
          const filePath = `${user.id}-additional-${i}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('groomer-profiles')
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('groomer-profiles')
            .getPublicUrl(filePath);

          profileImagesUrls.push(publicUrl);
        }
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
        profile_images: profileImagesUrls,
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
        profile_images: profileImagesUrls,
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

  return {
    formData,
    loading,
    handleFormDataChange,
    handleSpecializationToggle,
    handleImageChange,
    handleImagesChange,
    handleSubmit
  };
}
