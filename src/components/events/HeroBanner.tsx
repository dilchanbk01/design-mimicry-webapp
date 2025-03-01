
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/utils/imageCompression";
import { useToast } from "@/hooks/use-toast";

interface HeroBannerProps {
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
}

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

export function HeroBanner({ currentSlide, setCurrentSlide }: HeroBannerProps) {
  const { toast } = useToast();
  
  const { data: heroBanners = [], isLoading, error } = useQuery({
    queryKey: ['heroBanners'],
    queryFn: async () => {
      try {
        console.log("Fetching hero banners for Events page");
        const { data, error } = await supabase
          .from('hero_banners')
          .select('id, image_url, title, description')
          .eq('active', true)
          .eq('page', 'events');

        if (error) {
          console.error('Error fetching hero banners:', error);
          throw error;
        }
        
        console.log("Hero banners fetched:", data);
        return data || [];
      } catch (error) {
        console.error('Error fetching hero banners:', error);
        toast({
          title: "Error",
          description: "Failed to load hero banners",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gets focus to see new banners
  });

  if (error) {
    console.error("Error in hero banner query:", error);
  }

  if (isLoading) return <div className="h-[300px] bg-gray-200 animate-pulse"></div>;
  if (!heroBanners || heroBanners.length === 0) {
    console.log("No hero banners found");
    return null;
  }

  return (
    <div className="relative h-[300px]" data-testid="hero-banner-container">
      <div className="absolute inset-0 overflow-hidden">
        {heroBanners.map((banner, index) => (
          <div
            key={banner.id}
            data-hero-banner
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={getOptimizedImageUrl(banner.image_url, 1200)}
              alt={banner.title || 'Event banner'}
              className="w-full h-full object-cover"
              width="1200"
              height="300"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                console.error("Failed to load banner image:", banner.image_url);
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              {(banner.title || banner.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  {banner.title && (
                    <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                  )}
                  {banner.description && (
                    <p className="text-lg">{banner.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {heroBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
