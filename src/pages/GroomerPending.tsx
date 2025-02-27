
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

export default function GroomerPending() {
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/groomer-auth");
      return;
    }

    const { data: profile } = await supabase
      .from("groomer_profiles")
      .select("application_status")
      .eq("user_id", user.id)
      .single();

    if (profile?.application_status === "approved") {
      navigate("/groomer-dashboard");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/groomer-auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Clock className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Application Under Review</h1>
        <p className="text-gray-600 mb-8">
          Your application is currently being reviewed by our team. We'll notify you once it's approved.
        </p>
        <Button
          variant="outline"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
