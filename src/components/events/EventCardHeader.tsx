
import { getOptimizedImageUrl } from "@/utils/imageCompression";

interface EventCardHeaderProps {
  imageUrl: string;
  title: string;
}

export function EventCardHeader({ imageUrl, title }: EventCardHeaderProps) {
  return (
    <>
      <img
        src={getOptimizedImageUrl(imageUrl, 800)}
        alt={title}
        className="w-full h-48 object-cover"
        width="800"
        height="192"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 line-clamp-1">
          {title}
        </h3>
      </div>
    </>
  );
}
