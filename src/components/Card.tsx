
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
        "group relative w-full rounded-3xl p-4 shadow-lg",
        "transition-all duration-300 ease-out",
        "flex flex-col items-center justify-between",
        className
      )}
    >
      <div className="absolute top-3 right-3">
        <ArrowRight className="w-4 h-4 text-accent transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <h3 className="text-lg font-semibold text-accent absolute top-4 left-4">{title}</h3>
      <div className="flex-1 flex items-center justify-center w-full pt-8">
        <img src={icon} alt={title} className="w-20 h-20 object-contain" />
      </div>
    </button>
  );
}
