
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Package, 
  PlusCircle, 
  User, 
  Calendar,
  Search,
  ChevronDown,
  Edit,
  Scissors,
  Home,
  Store,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BookingsSection } from "@/components/groomer-dashboard/BookingsSection";
import { format, addDays, eachDayOfInterval, startOfDay, parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface GroomerProfile {
  id: string;
  salon_name: string;
  experience_years: number;
  specializations: string[];
  address: string;
  contact_number: string;
  bio: string | null;
  profile_image_url: string | null;
  home_service_cost: number;
  provides_home_service: boolean;
  provides_salon_service: boolean;
  is_available: boolean;
}

interface GroomingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  groomer_id: string;
  created_at: string;
}

interface BookingSummary {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

interface Revenue {
  day: number;
  amount: number;
}

interface AvailableSlot {
  date: string;
  times: string[];
}

export default function GroomerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [packages, setPackages] = useState<GroomingPackage[]>([]);
  const [bookings, setBookings] = useState<BookingSummary>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
  });
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: 0
  });
  const [editingPackage, setEditingPackage] = useState<GroomingPackage | null>(null);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showEditPackage, setShowEditPackage] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showTimeSlotSettings, setShowTimeSlotSettings] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    salon_name: '',
    experience_years: 0,
    bio: '',
    address: '',
    contact_number: '',
    home_service_cost: 0,
    provides_home_service: false,
    provides_salon_service: true,
    is_available: true
  });
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [availableTimes, setAvailableTimes] = useState<{[key: string]: boolean}>({
    "09:00 AM": true,
    "09:30 AM": true,
    "10:00 AM": true,
    "10:30 AM": true,
    "11:00 AM": true,
    "11:30 AM": true,
    "12:00 PM": true,
    "12:30 PM": true,
    "01:00 PM": true,
    "01:30 PM": true,
    "02:00 PM": true,
    "02:30 PM": true,
    "03:00 PM": true,
    "03:30 PM": true,
    "04:00 PM": true,
    "04:30 PM": true,
    "05:00 PM": true,
    "05:30 PM": true,
    "06:00 PM": true,
  });

  useEffect(() => {
    checkGroomerStatus();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchPackages();
      fetchBookingSummary();
      fetchRevenueData(timeframe);
      fetchAvailableSlots();
    }
  }, [profile, timeframe]);

  const checkGroomerStatus = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/groomer-auth");
        return;
      }

      const { data: groomerProfile, error } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !groomerProfile || groomerProfile.application_status !== 'approved') {
        navigate("/groomer-pending");
        return;
      }

      setProfile(groomerProfile);
      setEditedProfile({
        salon_name: groomerProfile.salon_name || '',
        experience_years: groomerProfile.experience_years || 0,
        bio: groomerProfile.bio || '',
        address: groomerProfile.address || '',
        contact_number: groomerProfile.contact_number || '',
        home_service_cost: groomerProfile.home_service_cost || 0,
        provides_home_service: groomerProfile.provides_home_service || false,
        provides_salon_service: groomerProfile.provides_salon_service || true,
        is_available: groomerProfile.is_available !== false // Default to true if null
      });
    } catch (error) {
      console.error("Error checking groomer status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('grooming_packages')
        .select('*')
        .eq('groomer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const typedPackages: GroomingPackage[] = data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          groomer_id: pkg.groomer_id,
          created_at: pkg.created_at
        }));
        
        setPackages(typedPackages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load grooming packages",
        variant: "destructive",
      });
    }
  };

  const fetchBookingSummary = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("status")
        .eq("groomer_id", profile.id);

      if (error) throw error;
      
      const summary = {
        total: data.length,
        completed: data.filter(b => b.status === 'completed').length,
        pending: data.filter(b => b.status === 'confirmed').length,
        cancelled: data.filter(b => b.status === 'cancelled').length
      };
      
      setBookings(summary);
    } catch (error) {
      console.error("Error fetching booking summary:", error);
    }
  };

  const fetchRevenueData = async (period: 'day' | 'week' | 'month') => {
    if (!profile) return;
    
    try {
      const mockData: Revenue[] = [];
      const daysToShow = period === 'day' ? 24 : period === 'week' ? 7 : 30;
      
      for (let i = 0; i < daysToShow; i++) {
        mockData.push({
          day: i + 1,
          amount: Math.floor(Math.random() * 1000) + 100
        });
      }
      
      setRevenue(mockData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('groomer_time_slots')
        .select('*')
        .eq('groomer_id', profile.id);

      if (error) {
        console.error("Error fetching slots:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setAvailableSlots(data);
      } else {
        // Initialize with default slots for the next 7 days if no slots exist
        const nextWeek = eachDayOfInterval({
          start: startOfDay(new Date()),
          end: addDays(startOfDay(new Date()), 6)
        });
        
        const defaultSlots = nextWeek.map(day => ({
          date: format(day, 'yyyy-MM-dd'),
          times: [
            "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
            "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
            "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
            "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
            "05:00 PM", "05:30 PM", "06:00 PM"
          ]
        }));
        
        setAvailableSlots(defaultSlots);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  const handleAddPackage = async () => {
    if (!profile) return;

    try {
      if (!newPackage.name || !newPackage.description || newPackage.price <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields with valid values",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('grooming_packages')
        .insert({
          name: newPackage.name,
          description: newPackage.description,
          price: newPackage.price,
          groomer_id: profile.id
        })
        .select();

      if (error) throw error;
      
      fetchPackages();
      
      toast({
        title: "Package Added",
        description: "Your grooming package has been added successfully",
      });
      
      setNewPackage({ name: '', description: '', price: 0 });
      setShowAddPackage(false);
    } catch (error) {
      console.error("Error adding package:", error);
      toast({
        title: "Error",
        description: "Failed to add grooming package",
        variant: "destructive",
      });
    }
  };

  const handleEditPackage = (pkg: GroomingPackage) => {
    setEditingPackage(pkg);
    setShowEditPackage(true);
  };

  const handleUpdatePackage = async () => {
    if (!profile || !editingPackage) return;

    try {
      const { error } = await supabase
        .from('grooming_packages')
        .update({
          name: editingPackage.name,
          description: editingPackage.description,
          price: editingPackage.price
        })
        .eq('id', editingPackage.id);

      if (error) throw error;
      
      fetchPackages();
      
      toast({
        title: "Package Updated",
        description: "Your grooming package has been updated successfully",
      });
      
      setEditingPackage(null);
      setShowEditPackage(false);
    } catch (error) {
      console.error("Error updating package:", error);
      toast({
        title: "Error",
        description: "Failed to update grooming package",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("groomer_profiles")
        .update({
          salon_name: editedProfile.salon_name,
          experience_years: editedProfile.experience_years,
          bio: editedProfile.bio,
          address: editedProfile.address,
          contact_number: editedProfile.contact_number,
          home_service_cost: editedProfile.home_service_cost,
          provides_home_service: editedProfile.provides_home_service,
          provides_salon_service: editedProfile.provides_salon_service,
          is_available: editedProfile.is_available
        })
        .eq("id", profile.id)
        .select();

      if (error) throw error;

      setProfile({
        ...profile,
        salon_name: editedProfile.salon_name,
        experience_years: editedProfile.experience_years,
        bio: editedProfile.bio,
        address: editedProfile.address,
        contact_number: editedProfile.contact_number,
        home_service_cost: editedProfile.home_service_cost,
        provides_home_service: editedProfile.provides_home_service,
        provides_salon_service: editedProfile.provides_salon_service,
        is_available: editedProfile.is_available
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      setShowEditProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;

    try {
      const newAvailability = !profile.is_available;
      
      const { error } = await supabase
        .from("groomer_profiles")
        .update({
          is_available: newAvailability
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        is_available: newAvailability
      });

      toast({
        title: newAvailability ? "You're Now Available" : "You're Now Unavailable",
        description: newAvailability 
          ? "Customers can now see your profile and book appointments" 
          : "Your profile is now hidden from customers",
      });
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
        toast({
          title: "Error",
          description: "New password and confirmation do not match",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: changePasswordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
      
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleTimeSlotChange = (time: string) => {
    setAvailableTimes(prev => ({
      ...prev, 
      [time]: !prev[time]
    }));
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    
    // Find if we already have settings for this date
    const existingSlot = availableSlots.find(slot => slot.date === date);
    
    if (existingSlot) {
      // Create a times object with all times set to false by default
      const timesObj: {[key: string]: boolean} = {};
      Object.keys(availableTimes).forEach(time => {
        timesObj[time] = false;
      });
      
      // Set the available times to true
      existingSlot.times.forEach(time => {
        timesObj[time] = true;
      });
      
      setAvailableTimes(timesObj);
    } else {
      // Reset to all available if no settings for this date
      const timesObj: {[key: string]: boolean} = {};
      Object.keys(availableTimes).forEach(time => {
        timesObj[time] = true;
      });
      setAvailableTimes(timesObj);
    }
  };

  const handleSaveTimeSlots = async () => {
    if (!profile) return;
    
    try {
      // Get the available times for the selected date
      const selectedTimes = Object.entries(availableTimes)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([time]) => time);
      
      // Check if we already have a slot for this date
      const existingSlotIndex = availableSlots.findIndex(slot => slot.date === selectedDate);
      
      let updatedSlots = [...availableSlots];
      
      if (existingSlotIndex >= 0) {
        // Update existing slot
        updatedSlots[existingSlotIndex] = {
          ...updatedSlots[existingSlotIndex],
          times: selectedTimes
        };
      } else {
        // Add new slot
        updatedSlots.push({
          date: selectedDate,
          times: selectedTimes
        });
      }
      
      // Save to the database
      const { error } = await supabase
        .from('groomer_time_slots')
        .upsert([
          {
            groomer_id: profile.id,
            date: selectedDate,
            times: selectedTimes
          }
        ], { onConflict: 'groomer_id,date' });

      if (error) throw error;
      
      setAvailableSlots(updatedSlots);
      
      toast({
        title: "Time Slots Updated",
        description: `Availability for ${format(parseISO(selectedDate), 'MMMM d, yyyy')} has been updated`,
      });
    } catch (error) {
      console.error("Error saving time slots:", error);
      toast({
        title: "Error",
        description: "Failed to save availability settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4CAF50] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Scissors className="h-8 w-8" />
              <span className="text-2xl font-bold">Petsu Groomer</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-green-700" onClick={() => setShowEditProfile(true)}>
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
              <Button 
                variant={profile?.is_available ? "ghost" : "outline"}
                className={profile?.is_available 
                  ? "text-white hover:bg-green-700 border border-white"
                  : "bg-white text-[#4CAF50] hover:bg-gray-100"
                }
                onClick={handleToggleAvailability}
              >
                {profile?.is_available ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Available
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Unavailable
                  </>
                )}
              </Button>
              <Button variant="outline" className="bg-white text-[#4CAF50] hover:bg-gray-100" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.salon_name}</h1>
          <p className="text-gray-600">Manage your grooming business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{bookings.total}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Search className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{bookings.pending}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">{packages.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="packages">Grooming Packages</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
            <TabsTrigger value="availability">Manage Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Appointments</h2>
            </div>
            
            {profile && <BookingsSection groomerId={profile.id} />}
          </TabsContent>
          
          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Grooming Packages</h2>
              <Button onClick={() => setShowAddPackage(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
            
            {packages.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't added any grooming packages yet.</p>
                <Button onClick={() => setShowAddPackage(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Package
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="overflow-hidden">
                    <div className="bg-[#4CAF50] h-2"></div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-[#4CAF50]">₹{pkg.price}</span>
                        <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="revenue">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Revenue Insights</h2>
                <Select defaultValue={timeframe} onValueChange={(value: 'day' | 'week' | 'month') => setTimeframe(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue {timeframe === 'day' ? 'Today' : timeframe === 'week' ? 'This Week' : 'This Month'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full flex items-end justify-between">
                    {revenue.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-[#4CAF50] w-6 md:w-8 rounded-t" 
                          style={{ height: `${(item.amount / 1000) * 250}px` }}
                        ></div>
                        <span className="text-xs mt-2">{timeframe === 'day' ? `${item.day}h` : `${item.day}`}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {timeframe === 'day' ? 'Today\'s Revenue' : timeframe === 'week' ? 'Weekly Revenue' : 'Monthly Revenue'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-2xl font-bold">₹{revenue.reduce((sum, item) => sum + item.amount, 0)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Average Per Booking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold">
                        ₹{bookings.completed > 0 
                          ? Math.round(revenue.reduce((sum, item) => sum + item.amount, 0) / bookings.completed) 
                          : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Estimated Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ChevronDown className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-2xl font-bold">12%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Your Availability</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="date-select">Select Date</Label>
                    <div className="flex gap-4 flex-wrap">
                      {eachDayOfInterval({
                        start: startOfDay(new Date()),
                        end: addDays(startOfDay(new Date()), 13)
                      }).map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = dateStr === selectedDate;
                        const dayStr = format(date, 'E');
                        const dateNum = format(date, 'd');
                        
                        return (
                          <button
                            key={dateStr}
                            onClick={() => handleDateChange(dateStr)}
                            className={`flex flex-col items-center justify-center h-16 w-16 rounded-lg border transition-colors ${
                              isSelected 
                                ? 'bg-green-100 border-green-500 text-green-800' 
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <span className="text-xs font-medium">{dayStr}</span>
                            <span className="text-lg font-bold">{dateNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Available Times for {format(parseISO(selectedDate), 'MMMM d, yyyy')}</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Toggle all times to be the same
                          const allTimes = Object.keys(availableTimes);
                          const areAllAvailable = allTimes.every(time => availableTimes[time]);
                          
                          const newAvailableTimes = {...availableTimes};
                          allTimes.forEach(time => {
                            newAvailableTimes[time] = !areAllAvailable;
                          });
                          
                          setAvailableTimes(newAvailableTimes);
                        }}
                      >
                        {Object.values(availableTimes).every(Boolean) ? 'Clear All' : 'Select All'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {Object.entries(availableTimes).map(([time, isAvailable]) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`time-${time}`} 
                            checked={isAvailable}
                            onCheckedChange={() => handleTimeSlotChange(time)}
                          />
                          <Label 
                            htmlFor={`time-${time}`}
                            className="text-sm cursor-pointer"
                          >
                            {time}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveTimeSlots} className="w-full">
                    Save Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddPackage} onOpenChange={setShowAddPackage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Grooming Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                placeholder="e.g. Deluxe Dog Grooming"
                value={newPackage.name}
                onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what's included in this package..."
                value={newPackage.description}
                onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newPackage.price}
                onChange={(e) => setNewPackage({...newPackage, price: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPackage(false)}>Cancel</Button>
            <Button onClick={handleAddPackage}>Add Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPackage} onOpenChange={setShowEditPackage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grooming Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Package Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g. Deluxe Dog Grooming"
                value={editingPackage?.name || ''}
                onChange={(e) => setEditingPackage(editingPackage ? {...editingPackage, name: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe what's included in this package..."
                value={editingPackage?.description || ''}
                onChange={(e) => setEditingPackage(editingPackage ? {...editingPackage, description: e.target.value} : null)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editingPackage?.price || 0}
                onChange={(e) => setEditingPackage(editingPackage ? 
                  {...editingPackage, price: parseFloat(e.target.value)} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPackage(false)}>Cancel</Button>
            <Button onClick={handleUpdatePackage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Profile Info</TabsTrigger>
              <TabsTrigger value="services" className="flex-1">Service Settings</TabsTrigger>
              <TabsTrigger value="password" className="flex-1">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="salon_name">Salon Name</Label>
                <Input
                  id="salon_name"
                  value={editedProfile.salon_name}
                  onChange={(e) => setEditedProfile({...editedProfile, salon_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={editedProfile.experience_years}
                  onChange={(e) => setEditedProfile({...editedProfile, experience_years: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editedProfile.address}
                  onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={editedProfile.contact_number}
                  onChange={(e) => setEditedProfile({...editedProfile, contact_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="availability">Availability Status</Label>
                  <Switch
                    id="availability"
                    checked={editedProfile.is_available}
                    onCheckedChange={(checked) => setEditedProfile({...editedProfile, is_available: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  When turned off, your profile will not be shown to customers
                </p>
              </div>
              <Button className="w-full" onClick={handleUpdateProfile}>Save Changes</Button>
            </TabsContent>
            <TabsContent value="services" className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="text-blue-600 h-5 w-5" />
                    <Label htmlFor="salon_service">Salon Service</Label>
                  </div>
                  <Switch
                    id="salon_service"
                    checked={editedProfile.provides_salon_service}
                    onCheckedChange={(checked) => setEditedProfile({...editedProfile, provides_salon_service: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500 ml-7">
                  Customers can book appointments at your location
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="text-purple-600 h-5 w-5" />
                      <Label htmlFor="home_service">Home Service</Label>
                    </div>
                    <Switch
                      id="home_service"
                      checked={editedProfile.provides_home_service}
                      onCheckedChange={(checked) => setEditedProfile({...editedProfile, provides_home_service: checked})}
                    />
                  </div>
                  <p className="text-xs text-gray-500 ml-7">
                    You will travel to customer's location for grooming service
                  </p>
                </div>
                
                {editedProfile.provides_home_service && (
                  <div className="mt-4 ml-7">
                    <div className="space-y-2">
                      <Label htmlFor="home_service_cost">Additional Cost for Home Service (₹)</Label>
                      <Input
                        id="home_service_cost"
                        type="number"
                        min="0"
                        value={editedProfile.home_service_cost}
                        onChange={(e) => setEditedProfile({...editedProfile, home_service_cost: parseInt(e.target.value) || 0})}
                        placeholder="e.g. 100"
                      />
                      <p className="text-xs text-gray-500">
                        This amount will be added to the base price when customers choose home service
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={handleUpdateProfile}>Save Changes</Button>
            </TabsContent>
            <TabsContent value="password" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleChangePassword}>Update Password</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
