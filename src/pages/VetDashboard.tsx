
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Users, Calendar, Clock, MapPin } from "lucide-react";

interface VetProfile {
  clinic_name: string;
  license_number: string;
  years_of_experience: number;
  specializations: string[];
  address: string;
  contact_number: string;
  bio: string;
  application_status: string;
}

export default function VetDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/vet-auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        navigate("/vet-auth");
        return;
      }

      setProfile(profile);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/vet-auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D26A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.clinic_name}</h1>
              <p className="text-sm text-gray-600">Welcome back!</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Patients</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Appointments</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold">Experience</h3>
                <p className="text-2xl font-bold">{profile?.years_of_experience} years</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                <p className="mt-1">{profile?.license_number}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                <p className="mt-1">{profile?.contact_number}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {profile?.address}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Specializations</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {profile?.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Bio</h3>
              <p className="mt-1 text-gray-600">{profile?.bio}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
