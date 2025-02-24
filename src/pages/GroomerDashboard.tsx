
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function GroomerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    checkGroomerStatus();
  }, []);

  const checkGroomerStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/groomer-auth");
        return;
      }

      const { data: groomerProfile } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!groomerProfile || groomerProfile.application_status !== 'approved') {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking groomer status:", error);
      navigate("/");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Groomer Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="text-gray-600">Welcome to your groomer dashboard! More features coming soon.</p>
        </div>
      </div>
    </div>
  );
}
