
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, MessageSquare, Users, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function DashboardStats() {
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [activeChats, setActiveChats] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;

        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        // Get today's appointments count - using a simpler approach without count option
        const appointmentsResult = await supabase
          .from('consultations')
          .select('id')
          .eq('vet_id', user.id)
          .eq('date', formattedToday)
          .neq('status', 'cancelled');

        setTodayAppointments(appointmentsResult.data?.length || 0);

        // Get active chats count - using a simpler approach without count option
        const chatsResult = await supabase
          .from('consultations')
          .select('id')
          .eq('vet_id', user.id)
          .eq('status', 'active');

        setActiveChats(chatsResult.data?.length || 0);

        // Get total patients
        const patientsResult = await supabase
          .from('consultations')
          .select('user_id')
          .eq('vet_id', user.id)
          .neq('status', 'cancelled');

        if (patientsResult.data) {
          // Count unique patient IDs
          const uniquePatients = new Set(patientsResult.data.map(p => p.user_id));
          setTotalPatients(uniquePatients.size);
        }

        // Calculate response rate (mock data for now)
        setResponseRate(95);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-2xl font-semibold">{loading ? '...' : todayAppointments}</p>
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
            <p className="text-2xl font-semibold">{loading ? '...' : activeChats}</p>
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
            <p className="text-2xl font-semibold">{loading ? '...' : totalPatients}</p>
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
            <p className="text-2xl font-semibold">{loading ? '...' : `${responseRate}%`}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
