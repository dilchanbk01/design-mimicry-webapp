
import { useNavigate } from "react-router-dom";
import { MenuCard } from "./MenuCard";
import { 
  Ticket, 
  Calendar, 
  HelpCircle, 
  Info,
  Scissors
} from "lucide-react";

const menuItems = [
  {
    icon: Ticket,
    title: "Your Tickets",
    subtitle: "View your booked events",
    tab: "tickets",
  },
  {
    icon: Calendar,
    title: "Your Events",
    subtitle: "Manage your organized events",
    tab: "events",
  },
  {
    icon: Scissors,
    title: "Grooming Bookings",
    subtitle: "View your pet grooming appointments",
    tab: "grooming",
  },
  {
    icon: HelpCircle,
    title: "Help & Support",
    subtitle: "Get assistance and FAQs",
    tab: "help",
  },
  {
    icon: Info,
    title: "About Us",
    subtitle: "Learn more about Petsu",
    tab: "about",
  },
];

interface MainMenuProps {
  onSignOut: () => void;
}

export function MainMenu({ onSignOut }: MainMenuProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      {menuItems.map((item, index) => (
        <MenuCard
          key={index}
          Icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onClick={() => navigate(`/profile?tab=${item.tab}`)}
        />
      ))}
      <button
        onClick={onSignOut}
        className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 bg-white rounded-xl shadow-sm p-4"
      >
        Sign out
      </button>
    </div>
  );
}
