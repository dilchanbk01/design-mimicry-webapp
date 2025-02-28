
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/utils/imageCompression";

interface GroomingHeroBannerProps {
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
}

interface HeroBanner {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

export function GroomingHeroBanner({ currentSlide, setCurrentSlide }: GroomingHeroBannerProps) {
  const { data: heroBanners = [] } = useQuery({
    queryKey: ['groomingHeroBanners'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('id, image_url')
          .eq('active', true)
          .eq('page', 'pet-grooming');

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching hero banners:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  if (heroBanners.length === 0) return null;

  return (
    <div className="relative h-[300px]">
      <div className="absolute inset-0 overflow-hidden">
        {heroBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={getOptimizedImageUrl(banner.image_url, 1200)}
              alt="Grooming banner"
              className="w-full h-full object-cover"
              width="1200"
              height="300"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ))}
      </div>

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
    </div>
  );
}
