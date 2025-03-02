
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle2, ArrowLeft, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroomerPending() {
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
    
    // Set up real-time subscription to profile changes
    const subscription = supabase
      .channel('groomer-status-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'groomer_profiles',
        filter: `user_id=eq.${getUserId()}`
      }, handleProfileChange)
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserId = () => {
    const user = supabase.auth.getUser();
    return user?.data?.user?.id;
  };

  const handleProfileChange = (payload: any) => {
    const newStatus = payload.new.application_status;
    if (newStatus === "approved") {
      navigate("/groomer-dashboard");
    } else if (newStatus === "rejected") {
      navigate("/groomer-auth");
    }
  };

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
    } else if (profile?.application_status === "rejected") {
      navigate("/groomer-auth");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/groomer-auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-amber-100 p-4 rounded-full">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Under Review</CardTitle>
          <CardDescription className="text-base mt-2">
            Your application is currently being reviewed by our team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-amber-800">
                  We'll review your information usually within 24-48 hours and notify you once your application is approved.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Have questions? Contact us at support@petals.com
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
          <Button
            variant="ghost"
            className="w-full text-gray-500"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
