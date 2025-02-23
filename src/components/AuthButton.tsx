
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AuthButton() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user ? (
    <Button
      onClick={() => navigate("/profile")}
      variant="outline"
      className="gap-2"
    >
      <UserCircle className="w-5 h-5" />
      Profile
    </Button>
  ) : (
    <Button
      onClick={() => navigate("/auth")}
      variant="outline"
      className="gap-2"
    >
      <UserCircle className="w-5 h-5" />
      Sign In
    </Button>
  );
}
