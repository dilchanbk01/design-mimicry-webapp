
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Stethoscope, User, Calendar, MessageSquare, 
  BookOpen, ChartBar, LogOut, Plug
} from "lucide-react";

interface SidebarProps {
  isOnline: boolean;
  toggleAvailability: () => void;
  handleLogout: () => void;
}

export function Sidebar({ isOnline, toggleAvailability, handleLogout }: SidebarProps) {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-semibold">Vet Dashboard</span>
        </div>

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
            <User className="mr-3 h-5 w-5" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
            <Calendar className="mr-3 h-5 w-5" />
            Appointments
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
            <MessageSquare className="mr-3 h-5 w-5" />
            Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
            <BookOpen className="mr-3 h-5 w-5" />
            Resources
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
            <ChartBar className="mr-3 h-5 w-5" />
            Analytics
          </Button>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
        <div className="space-y-3">
          <Button 
            variant={isOnline ? "default" : "outline"}
            className={cn(
              "w-full justify-start",
              isOnline && "bg-green-500 hover:bg-green-600"
            )}
            onClick={toggleAvailability}
          >
            <Plug className={cn("mr-3 h-5 w-5", isOnline && "text-white")} />
            {isOnline ? 'Online' : 'Offline'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
