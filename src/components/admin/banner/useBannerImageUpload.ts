
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";

export async function uploadBannerImage(imageFile: File): Promise<string> {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  try {
    // Compress the image before uploading
    const compressedFile = await compressImage(imageFile);
    
    const fileExt = compressedFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `banners/${fileName}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error("Error in uploadBannerImage:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}
