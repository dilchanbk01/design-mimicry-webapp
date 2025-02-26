
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Instagram, LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function EventShareMenu() {
  const { toast } = useToast();

  const handleShare = async (platform: string) => {
    const eventUrl = window.location.href;
    const message = `Check out this event`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n${eventUrl}`)}`, '_blank');
        break;
      case 'instagram':
        await navigator.clipboard.writeText(eventUrl);
        toast({
          title: "Link Copied!",
          description: "Share this link on Instagram",
        });
        break;
      case 'copy':
        await navigator.clipboard.writeText(eventUrl);
        toast({
          title: "Success",
          description: "Link copied to clipboard!",
        });
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
            alt="WhatsApp" 
            className="w-4 h-4 mr-2"
          />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('instagram')}>
          <Instagram className="h-4 w-4 mr-2" />
          Share on Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
