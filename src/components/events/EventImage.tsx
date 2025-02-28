
import { getOptimizedImageUrl } from "@/utils/imageCompression";

interface EventImageProps {
  imageUrl?: string;
  altText: string;
}

export function EventImage({ imageUrl, altText }: EventImageProps) {
  return (
    <div className="relative w-full h-72">
      <img
        src={imageUrl ? getOptimizedImageUrl(imageUrl, 1200) : '/placeholder.svg'}
        alt={altText}
        className="w-full h-full object-cover"
        width="1200"
        height="288"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
    </div>
  );
}
