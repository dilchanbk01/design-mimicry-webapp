
import imageCompression from 'browser-image-compression';
import { supabase } from "@/integrations/supabase/client";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}

export function getOptimizedImageUrl(url: string, width = 800): string {
  if (!url) return '/placeholder.svg';
  
  // If it's already an optimized URL or a data URL, return it as is
  if (url.startsWith('data:') || url.includes('w=')) {
    return url;
  }
  
  // For Unsplash images, use their optimization API
  if (url.includes('unsplash.com')) {
    return `${url.split('?')[0]}?w=${width}&auto=format&fit=crop&q=80`;
  }
  
  // For our own URLs, we keep them as is for now
  // In a production environment, you would use an image CDN like Cloudinary or Imgix
  return url;
}

// Upload banner image to Supabase storage
export async function uploadBannerImage(file: File): Promise<string> {
  // First compress the image
  const compressedFile = await compressImage(file);
  
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;
    
    // Check if banners bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'banners')) {
      await supabase.storage.createBucket('banners', {
        public: true
      });
    }
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('banners')
      .upload(filePath, compressedFile);
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('banners')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading banner image:', error);
    throw error;
  }
}
