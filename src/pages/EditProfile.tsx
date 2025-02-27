
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

interface Profile {
  full_name: string;
  phone_number: string;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/10 pt-20">
      <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate("/profile")}
              className="absolute left-4 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-lg">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone_number}
                onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/profile")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
