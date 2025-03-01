
import imageCompression from 'browser-image-compression';

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

// Add the missing uploadBannerImage function
export async function uploadBannerImage(file: File): Promise<string> {
  // First compress the image
  const compressedFile = await compressImage(file);
  
  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('file', compressedFile);
    
    // Simulate a delay to show upload progress (in a real app, this would be an actual API call)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock URL or placeholder for now
    // In a real app, this would be the URL returned from your backend
    return URL.createObjectURL(compressedFile);
  } catch (error) {
    console.error('Error uploading banner image:', error);
    throw error;
  }
}
