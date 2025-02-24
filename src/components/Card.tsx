
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
        "group relative w-full rounded-3xl p-8 shadow-lg",
        "transition-all duration-300 ease-out",
        "flex flex-col items-center justify-between",
        className
      )}
    >
      <div className="absolute top-6 right-6">
        <ArrowRight className="w-6 h-6 text-accent transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <h3 className="text-2xl font-semibold text-accent absolute top-8 left-8">{title}</h3>
      <div className="flex-1 flex items-center justify-center w-full pt-12">
        <img src={icon} alt={title} className="w-40 h-40 object-contain" />
      </div>
    </button>
  );
}
