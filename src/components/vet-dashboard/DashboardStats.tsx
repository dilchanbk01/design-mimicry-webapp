
import { Card } from "@/components/ui/card";
import { Calendar, MessageSquare, Users, Activity } from "lucide-react";

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full">
            <MessageSquare className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Chats</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-full">
            <Users className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-full">
            <Activity className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Response Rate</p>
            <p className="text-2xl font-semibold">0%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
