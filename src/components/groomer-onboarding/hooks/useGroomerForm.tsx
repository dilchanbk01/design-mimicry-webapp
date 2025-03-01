
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFormDataChange = (updates: Partial<GroomerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear validation errors for fields that are being updated
    const fieldsBeingUpdated = Object.keys(updates);
    if (fieldsBeingUpdated.length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        fieldsBeingUpdated.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
    
    // Clear specializations validation error when user selects any specialization
    if (validationErrors.specializations) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.specializations;
        return newErrors;
      });
    }
  };

  const handleImageChange = async (file: File) => {
    try {
      const compressedFile = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        profileImage: compressedFile
      }));
      
      // Clear profile image validation error
      if (validationErrors.profileImage) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }
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
    
    // Clear profile images validation error
    if (validationErrors.profileImages) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profileImages;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Salon name validation
    if (!formData.salonName.trim()) {
      errors.salonName = "Salon name is required";
    } else if (formData.salonName.trim().length < 3) {
      errors.salonName = "Salon name must be at least 3 characters";
    }
    
    // Experience validation
    if (!formData.experienceYears) {
      errors.experienceYears = "Years of experience is required";
    } else if (parseInt(formData.experienceYears) < 0) {
      errors.experienceYears = "Experience years cannot be negative";
    }
    
    // Specializations validation
    if (formData.specializations.length === 0) {
      errors.specializations = "Please select at least one specialization";
    }
    
    // Address validation
    if (!formData.streetAddress.trim()) {
      errors.streetAddress = "Street address is required";
    }
    
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode must be a 6-digit number";
    }
    
    // Contact number validation
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      errors.contactNumber = "Please enter a valid 10-digit phone number";
    }
    
    // Bio validation
    if (formData.bio.trim() && formData.bio.trim().length < 20) {
      errors.bio = "Bio should be at least 20 characters if provided";
    }
    
    // Service type validation
    if (!formData.providesHomeService && !formData.providesSalonService) {
      errors.serviceType = "Please select at least one service type";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!validateForm()) {
      // Show toast with error count
      const errorCount = Object.keys(validationErrors).length;
      toast({
        title: `Form has ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`,
        description: "Please correct the highlighted fields and try again.",
        variant: "destructive"
      });
      return;
    }
    
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
    validationErrors,
    handleFormDataChange,
    handleSpecializationToggle,
    handleImageChange,
    handleImagesChange,
    handleSubmit
  };
}
