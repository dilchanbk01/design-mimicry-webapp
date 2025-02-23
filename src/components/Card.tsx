
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  icon: string;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, icon, className, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full max-w-sm aspect-square bg-secondary rounded-3xl p-8",
        "transition-all duration-300 ease-out hover:shadow-lg hover:animate-card-hover",
        "flex flex-col items-center justify-between",
        className
      )}
    >
      <div className="absolute top-6 right-6">
        <ArrowRight className="w-6 h-6 text-accent transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <img src={icon} alt={title} className="w-32 h-32 object-contain" />
        <h3 className="text-xl font-semibold text-accent">{title}</h3>
      </div>
    </button>
  );
}
