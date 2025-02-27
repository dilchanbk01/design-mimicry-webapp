
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  icon: string;
  className?: string;
  titleClassName?: string;
  onClick?: () => void;
}

export function Card({ title, icon, className, titleClassName, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-2xl p-3 shadow-lg",
        "transition-all duration-300 ease-out",
        "flex flex-col items-center justify-between",
        className
      )}
    >
      <div className="absolute top-2 right-2">
        <ArrowRight className="w-5 h-5 text-accent transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <h3 className={cn("text-sm font-semibold text-accent absolute top-3 left-3", titleClassName)}>
        {title}
      </h3>
      <div className="flex-1 flex items-center justify-center w-full pt-6">
        <img 
          src={icon} 
          alt={title} 
          className="w-32 h-32 object-contain"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
    </button>
  );
}
