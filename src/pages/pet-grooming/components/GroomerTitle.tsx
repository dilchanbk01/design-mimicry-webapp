
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GroomerTitleProps {
  name: string;
  years: number;
  isAvailable: boolean;
}

export function GroomerTitle({ name, years, isAvailable }: GroomerTitleProps) {
  const { toast } = useToast();

  const handleShareGroomer = async () => {
    const shareData = {
      title: `${name} - Pet Grooming`,
      text: `Check out ${name} for pet grooming services!`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "The groomer details have been shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard!",
        description: "You can now share it with your friends.",
      });
    }
  };

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">{name}</h1>
        {!isAvailable && (
          <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Currently Unavailable
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-8 w-8 border-green-500 text-green-600 hover:bg-green-50 ml-auto"
        onClick={handleShareGroomer}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
