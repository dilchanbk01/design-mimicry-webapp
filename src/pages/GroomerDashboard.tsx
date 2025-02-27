
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
  Scissors
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GroomerProfile {
  id: string;
  salon_name: string;
  experience_years: number;
  specializations: string[];
  address: string;
  contact_number: string;
  bio: string | null;
  profile_image_url: string | null;
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
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    salon_name: '',
    experience_years: 0,
    bio: '',
    address: '',
    contact_number: ''
  });
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    checkGroomerStatus();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchPackages();
      fetchBookingSummary();
      fetchRevenueData(timeframe);
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
        contact_number: groomerProfile.contact_number || ''
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
      // Use a raw query instead of rpc for the TypeScript error
      const { data, error } = await supabase
        .from('grooming_packages')
        .select('*')
        .eq('groomer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Convert data to our interface type
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
      
      // Calculate summary from bookings
      const summary = {
        total: data.length,
        completed: data.filter(b => b.status === 'completed').length,
        pending: data.filter(b => b.status === 'pending').length,
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
      // In a real app, you'd query revenue data based on the timeframe
      // For this demo, we'll generate mock data
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

      // Use regular insert instead of RPC
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
      
      // Refresh the packages list
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
          contact_number: editedProfile.contact_number
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
        contact_number: editedProfile.contact_number
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

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="packages">Grooming Packages</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
          </TabsList>
          
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
                        <span className="text-2xl font-bold text-[#4CAF50]">${pkg.price}</span>
                        <Button variant="outline" size="sm">
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
                      <span className="text-2xl font-bold">${revenue.reduce((sum, item) => sum + item.amount, 0)}</span>
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
                        ${bookings.completed > 0 
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
        </Tabs>
      </div>

      {/* Add Package Dialog */}
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
              <Label htmlFor="price">Price ($)</Label>
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

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Profile Info</TabsTrigger>
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
