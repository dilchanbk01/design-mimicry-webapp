
interface GroomerImageBannerProps {
  imageUrl: string | null;
  altText: string;
}

export function GroomerImageBanner({ imageUrl, altText }: GroomerImageBannerProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60';
  
  return (
    <div className="w-full h-72 md:h-96 relative">
      <img
        src={imageUrl || defaultImage}
        alt={altText}
        className="w-full h-full object-cover"
        width="1200"
        height="384"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-transparent"></div>
    </div>
  );
}
