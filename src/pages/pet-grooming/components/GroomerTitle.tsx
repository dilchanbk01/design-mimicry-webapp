
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GroomerTitleProps {
  title: string;
}

export function GroomerTitle({ title }: GroomerTitleProps) {
  const { toast } = useToast();

  const handleShareGroomer = async () => {
    const shareData = {
      title: `${title} - Pet Grooming`,
      text: `Check out ${title} for pet grooming services!`,
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
      <h1 className="text-2xl font-bold text-green-800">{title}</h1>
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
