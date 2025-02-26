
export const compressImage = async (file: File, maxWidth = 1200, maxHeight = 800, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

export const getOptimizedImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return url;
  
  // If it's already a CDN URL, return as is
  if (url.includes('imagedelivery.net')) return url;
  
  // If it's a Supabase storage URL, transform it to use Cloudflare Images
  if (url.includes('storage.googleapis.com')) {
    // Extract the file name from the URL
    const fileName = url.split('/').pop();
    // Return the Cloudflare Images URL
    return `https://imagedelivery.net/your-account/${fileName}/public`;
  }
  
  // For local development or other URLs, return as is
  return url;
};
