
import { supabase } from "@/integrations/supabase/client";

export async function uploadBannerImage(imageFile: File): Promise<string> {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  // Check if the storage bucket exists
  const { data: bucketData, error: bucketError } = await supabase
    .storage
    .getBucket('images');

  if (bucketError && bucketError.message.includes('does not exist')) {
    // Create the bucket if it doesn't exist
    const { error: createBucketError } = await supabase
      .storage
      .createBucket('images', { public: true });
    
    if (createBucketError) {
      throw new Error(`Failed to create storage bucket: ${createBucketError.message}`);
    }
  }

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    if (uploadError.message.includes("already exists")) {
      // Handle file already exists error by generating a new name
      const newFileName = `${crypto.randomUUID()}-${Date.now()}.${fileExt}`;
      const newFilePath = `banners/${newFileName}`;
      
      const { error: retryUploadError } = await supabase.storage
        .from("images")
        .upload(newFilePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (retryUploadError) throw retryUploadError;
      
      const { data } = supabase.storage.from("images").getPublicUrl(newFilePath);
      return data.publicUrl;
    } else {
      throw uploadError;
    }
  } else {
    // Get the public URL of the uploaded image
    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
  }
}
