
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";

export function useBannerImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Debug useEffect to track imageUrl changes
  useEffect(() => {
    console.log("imageUrl state changed:", imageUrl);
  }, [imageUrl]);

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
      
      // Create banners bucket if it doesn't exist
      console.log("Checking if banners bucket exists");
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        
        // If the bucket doesn't exist, create it
        if (!buckets?.find(bucket => bucket.name === 'banners')) {
          console.log("Creating banners bucket");
          const { error: createBucketError } = await supabase.storage.createBucket('banners', {
            public: true
          });
          
          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError);
            throw createBucketError;
          }
          
          // Set bucket to public
          const { error: updateBucketError } = await supabase.storage.updateBucket('banners', {
            public: true
          });
          
          if (updateBucketError) {
            console.error("Error making bucket public:", updateBucketError);
          }
        } else {
          console.log("Banners bucket already exists");
        }
      } catch (bucketError) {
        console.error("Bucket operation error:", bucketError);
      }
      
      // Upload to Supabase storage
      console.log("Uploading to storage");
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, compressedFile);
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      console.log("Getting public URL");
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      console.log("Public URL:", publicUrl);
      
      // Clear the interval and set the upload progress to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Important: Set the image URL
      setImageUrl(publicUrl);
      
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Utility function to upload image from URL
  const uploadImageFromUrl = async (imageUrl: string, pageName: string = 'events') => {
    setIsUploading(true);
    setUploadProgress(10);
    console.log(`Starting image upload from URL for ${pageName} page`);
    
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const file = new File([blob], `${pageName}_banner.jpg`, { type: 'image/jpeg' });
      
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
      const fileName = `${pageName}_banner_${Date.now()}.jpg`;
      const filePath = `banners/${fileName}`;
      
      // Ensure banners bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        
        if (!buckets?.find(bucket => bucket.name === 'banners')) {
          console.log("Creating banners bucket");
          const { error: createBucketError } = await supabase.storage.createBucket('banners', {
            public: true
          });
          
          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError);
            throw createBucketError;
          }
          
          // Set bucket to public
          const { error: updateBucketError } = await supabase.storage.updateBucket('banners', {
            public: true
          });
          
          if (updateBucketError) {
            console.error("Error making bucket public:", updateBucketError);
          }
        }
      } catch (bucketError) {
        console.error("Bucket operation error:", bucketError);
      }
      
      // Upload to Supabase storage
      console.log("Uploading to storage");
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, compressedFile);
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      console.log("Public URL:", publicUrl);
      
      // Clear the interval and set the upload progress to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set the image URL
      setImageUrl(publicUrl);
      
      // Return the URL for direct creation
      return publicUrl;
      
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      return null;
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
    uploadImageFromUrl,
    resetUpload,
    imageUrl
  };
}
