
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TransparentHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export function TransparentHeader({ 
  showBackButton = true,
  title
}: TransparentHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="flex justify-center flex-1">
            {title ? (
              <h1 className="text-lg font-medium">{title}</h1>
            ) : (
              <img 
                src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
                alt="Petsu"
                className="h-8 sm:h-10 cursor-pointer"
                onClick={() => navigate('/')}
              />
            )}
          </div>
          
          <div className="flex justify-end flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
