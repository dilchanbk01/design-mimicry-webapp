import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, User, Calendar, MessageSquare, 
  BookOpen, ChartBar, LogOut, Plug, X, Check 
} from "lucide-react";
import { useConsultation } from "@/hooks/use-consultation";

interface VetProfile {
  clinic_name: string;
  application_status: string;
  specializations: string[];
  years_of_experience: number;
  bio: string | null;
  is_online: boolean;
}

interface PendingConsultation {
  id: string;
  created_at: string;
}

export default function VetDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingConsultations, setPendingConsultations] = useState<PendingConsultation[]>([]);
  const { isOnline, toggleAvailability, handleConsultation } = useConsultation();

  useEffect(() => {
    checkAuth();
    loadVetProfile();
    subscribeToConsultations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/vet-auth");
    }
  };

  const loadVetProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      setProfile({
        ...data,
        is_online: data.is_online ?? false
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConsultations = () => {
    const channel = supabase
      .channel('pending-consultations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultations',
          filter: 'status=eq.pending',
        },
        (payload) => {
          setPendingConsultations(current => [...current, payload.new as PendingConsultation]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/vet-auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <Stethoscope className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
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

      {/* Main content */}
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-semibold mb-4">Welcome, Dr. {profile?.clinic_name}</h1>
            <div className="text-sm text-gray-500">
              {profile?.application_status === 'pending' && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-md mb-4">
                  Your application is currently under review. We'll notify you once it's approved.
                </div>
              )}
              <p className="mb-2">
                <strong>Specializations:</strong>{" "}
                {profile?.specializations?.join(", ")}
              </p>
              <p className="mb-2">
                <strong>Years of Experience:</strong>{" "}
                {profile?.years_of_experience}
              </p>
              {profile?.bio && (
                <p className="mb-2">
                  <strong>Bio:</strong> {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Pending Consultations */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Pending Consultations</h2>
            {pendingConsultations.length === 0 ? (
              <p className="text-gray-500">No pending consultation requests</p>
            ) : (
              <div className="space-y-4">
                {pendingConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">New Consultation Request</p>
                      <p className="text-sm text-gray-500">
                        Received: {new Date(consultation.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleConsultation(consultation.id, 'accept')}
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                        onClick={() => handleConsultation(consultation.id, 'decline')}
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
              <p className="text-gray-500">No appointments scheduled</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Messages</h2>
              <p className="text-gray-500">No new messages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
