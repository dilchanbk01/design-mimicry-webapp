
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: heroBanners = [] } = useQuery({
    queryKey: ['heroBanners'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('id, image_url, title, description')
          .eq('active', true)
          .eq('page', 'events');

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
              src={banner.image_url}
              alt={banner.title || 'Event banner'}
              className="w-full h-full object-cover"
              loading="lazy"
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
