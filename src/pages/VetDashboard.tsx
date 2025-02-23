
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";
import { useConsultation } from "@/hooks/use-consultation";
import { Sidebar } from "@/components/vet-dashboard/Sidebar";
import { ProfileSection } from "@/components/vet-dashboard/ProfileSection";
import { ConsultationsSection } from "@/components/vet-dashboard/ConsultationsSection";
import { DashboardStats } from "@/components/vet-dashboard/DashboardStats";
import type { VetProfile } from "@/types/vet";

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
      
      setProfile(data);
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

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOnline={isOnline}
        toggleAvailability={toggleAvailability}
        handleLogout={handleLogout}
      />
      
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <ProfileSection profile={profile} />
          <DashboardStats />
          <ConsultationsSection 
            pendingConsultations={pendingConsultations}
            handleConsultation={handleConsultation}
          />
        </div>
      </div>
    </div>
  );
}
