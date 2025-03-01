
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";

export function useBannerImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    console.log("Starting image upload");
    
    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);
      
      // Compress the image
      const compressedFile = await compressImage(file);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;
      
      // Check if banners bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'banners')) {
        console.log("Creating banners bucket");
        try {
          await supabase.storage.createBucket('banners', {
            public: true
          });
        } catch (bucketError) {
          console.error("Error creating bucket:", bucketError);
        }
      }
      
      // Upload to Supabase storage
      console.log("Uploading to storage");
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(filePath, compressedFile);
      
      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }
      
      // Get the public URL
      console.log("Getting public URL");
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      console.log("Public URL:", publicUrl);
      setImageUrl(publicUrl);
      setUploadProgress(100);
      
      clearInterval(progressInterval);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      console.log("Upload complete. imageUrl:", imageUrl);
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
