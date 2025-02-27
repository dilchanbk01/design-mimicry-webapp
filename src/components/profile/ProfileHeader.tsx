
import { User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  fullName: string;
}

export function ProfileHeader({ fullName }: ProfileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <User className="h-8 w-8" />
      </Avatar>
      <div>
        <h1 className="text-xl font-semibold">
          Hello, {fullName || "there"}!
        </h1>
        <button 
          onClick={() => navigate("/profile/edit")}
          className="text-sm text-gray-600 hover:text-primary transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
