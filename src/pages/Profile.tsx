
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Ticket, Calendar, User, LogOut, Lock, Mail, Edit2 } from "lucide-react";

interface UserEvent {
  id: string;
  title: string;
  date: string;
  image_url: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Booking {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    image_url: string;
    location: string;
  };
}

interface UserProfile {
  email: string;
  full_name: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setProfile({
        email: user.email || "",
        full_name: user.user_metadata?.full_name || ""
      });

      try {
        // Fetch events created by user
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", user.id)
          .order('date', { ascending: false });

        if (eventsError) throw eventsError;
        setUserEvents((events || []).map(event => ({
          ...event,
          status: event.status as 'pending' | 'approved' | 'rejected'
        })));

        // Fetch user's bookings with event details
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            event:events (
              id,
              title,
              date,
              image_url,
              location
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "confirmed");

        if (bookingsError) throw bookingsError;
        setUserBookings(bookings || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleUpdatePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setNewPassword("");
    }
  };

  const handleUpdateEmail = async () => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update email.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Email update confirmation sent.",
      });
      setNewEmail("");
    }
  };

  const handleUpdateName = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: newName }
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update name.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Name updated successfully.",
      });
      setProfile(prev => prev ? { ...prev, full_name: newName } : null);
      setNewName("");
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00D26A]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-8"
            />
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              className="text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 px-4 pb-20">
        <div className="container mx-auto max-w-lg">
          <Tabs defaultValue="tickets" className="bg-white rounded-xl shadow-lg mt-4">
            <TabsList className="w-full justify-start border-b p-0">
              <TabsTrigger
                value="tickets"
                className="flex items-center gap-2 px-4 py-3 rounded-none data-[state=active]:border-b-2 border-[#00D26A]"
              >
                <Ticket className="h-4 w-4" />
                Your Tickets
              </TabsTrigger>
              {userEvents.length > 0 && (
                <TabsTrigger
                  value="events"
                  className="flex items-center gap-2 px-4 py-3 rounded-none data-[state=active]:border-b-2 border-[#00D26A]"
                >
                  <Calendar className="h-4 w-4" />
                  Your Events
                </TabsTrigger>
              )}
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 px-4 py-3 rounded-none data-[state=active]:border-b-2 border-[#00D26A]"
              >
                <User className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="p-4">
              {userBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">You haven't booked any events yet.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/events")}
                    className="mt-2"
                  >
                    Browse events
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/events/${booking.event.id}`)}
                    >
                      <img
                        src={booking.event.image_url}
                        alt={booking.event.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold">{booking.event.title}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(booking.event.date), "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {userEvents.length > 0 && (
              <TabsContent value="events" className="p-4">
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            event.status === 'approved' ? 'bg-green-100 text-green-800' :
                            event.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(event.date), "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="settings" className="p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Name</label>
                      <p className="text-gray-600">{profile?.full_name || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Email</label>
                      <p className="text-gray-600">{profile?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Update Name
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                      />
                      <Button onClick={handleUpdateName} disabled={!newName}>Update</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Update Email
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email"
                      />
                      <Button onClick={handleUpdateEmail} disabled={!newEmail}>Update</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Update Password
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button onClick={handleUpdatePassword} disabled={!newPassword}>Update</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
