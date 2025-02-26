
import { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface MenuCardProps {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export function MenuCard({ Icon, title, subtitle, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-600">{subtitle}</div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
  );
}
