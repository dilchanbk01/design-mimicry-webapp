
import { Button } from "@/components/ui/button";
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
          <Stethoscope className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">Vet Dashboard</span>
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Calendar className="mr-2" />
            Appointments
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <MessageSquare className="mr-2" />
            Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BookOpen className="mr-2" />
            Resources
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ChartBar className="mr-2" />
            Analytics
          </Button>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
        <Button 
          variant={isOnline ? "default" : "outline"}
          className="w-full justify-start"
          onClick={toggleAvailability}
        >
          <Plug className={`mr-2 ${isOnline ? 'text-white' : ''}`} />
          {isOnline ? 'Online' : 'Offline'}
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
