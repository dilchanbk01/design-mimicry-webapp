
import { useState } from "react";

export function useBannerImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);
      
      // Use the imported function from parent directory
      const { uploadBannerImage } = await import("../../../utils/imageCompression");
      const url = await uploadBannerImage(file);
      setImageUrl(url);
      setUploadProgress(100);
      
      clearInterval(progressInterval);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setImagePreview(null);
    setImageUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return {
    imagePreview,
    isUploading,
    uploadProgress,
    uploadImage,
    resetUpload,
    imageUrl
  };
}
