
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, AlertCircle, WalletCards, User, Phone, MapPin, CalendarClock } from "lucide-react";

interface GroomerProfile {
  id: string;
  salon_name: string;
  experience_years: number;
  application_status: string;
  created_at: string;
  admin_notes: string | null;
  contact_number: string;
  address: string;
  bio: string | null;
  email?: string;
  user_id?: string;
  bank_details?: {
    account_name: string;
    account_number: string;
    ifsc_code: string;
  } | null;
}

interface GroomerManagementProps {
  searchQuery: string;
  onRefresh: () => void;
}

export function GroomerManagement({ searchQuery, onRefresh }: GroomerManagementProps) {
  const { toast } = useToast();
  const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
  const [filteredGroomers, setFilteredGroomers] = useState<GroomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredGroomers(
        groomers.filter(groomer => 
          groomer.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.contact_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.bank_details?.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.bank_details?.account_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          groomer.bank_details?.ifsc_code?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredGroomers(groomers);
    }
  }, [searchQuery, groomers]);

  const fetchGroomers = async () => {
    try {
      setLoading(true);
      console.log("Fetching groomer applications...");
      
      // Drop any filters to see all groomer profiles
      const { data, error } = await supabase
        .from("groomer_profiles")
        .select("*");
      
      if (error) {
        console.error("Error fetching groomers:", error);
        throw error;
      }
      
      console.log("Raw groomer data:", data);
      
      if (data && data.length > 0) {
        // Get user emails for groomers
        const userIds = data.map(groomer => groomer.user_id);
        
        // Fetch user data first
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (userError) {
          console.error("Error fetching user data:", userError);
        }

        // Fetch bank details for all groomers
        const groomerBankDetails = await Promise.all(
          data.map(async (groomer) => {
            const { data: bankData, error: bankError } = await supabase
              .from('groomer_bank_details')
              .select('*')
              .eq('groomer_id', groomer.id)
              .maybeSingle();

            if (bankError && bankError.code !== 'PGRST116') {
              console.error(`Error fetching bank details for groomer ${groomer.id}:`, bankError);
              return null;
            }

            return {
              groomerId: groomer.id,
              details: bankData || null
            };
          })
        );
        
        // Process the data to ensure we have all fields needed
        const processedData = data.map(groomer => {
          const userInfo = userData ? userData.find(u => u.id === groomer.user_id) : null;
          const bankInfo = groomerBankDetails.find(bd => bd && bd.groomerId === groomer.id);
          
          return {
            id: groomer.id,
            user_id: groomer.user_id,
            salon_name: groomer.salon_name || "Unnamed Salon",
            experience_years: groomer.experience_years || 0,
            application_status: groomer.application_status || "pending",
            created_at: groomer.created_at || new Date().toISOString(),
            admin_notes: groomer.admin_notes,
            contact_number: groomer.contact_number || "Not provided",
            address: groomer.address || "Not provided",
            bio: groomer.bio,
            email: userInfo?.full_name || "Unknown user",
            bank_details: bankInfo?.details ? {
              account_name: bankInfo.details.account_name,
              account_number: bankInfo.details.account_number,
              ifsc_code: bankInfo.details.ifsc_code
            } : null
          };
        });
        
        console.log("Processed groomer data:", processedData);
        setGroomers(processedData);
        setFilteredGroomers(processedData);
      } else {
        console.log("No groomer data found or empty array returned");
        setGroomers([]);
        setFilteredGroomers([]);
      }
    } catch (error) {
      console.error("Error fetching groomers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch groomer applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGroomerStatus = async (groomerId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Updating groomer ${groomerId} to status: ${status}`);
      
      const { error } = await supabase
        .from("groomer_profiles")
        .update({ application_status: status })
        .eq("id", groomerId);

      if (error) {
        console.error("Error updating groomer status:", error);
        throw error;
      }

      console.log("Groomer status updated successfully");
      toast({
        title: "Success",
        description: `Groomer application ${status}`,
      });

      fetchGroomers();
    } catch (error) {
      console.error("Error updating groomer status:", error);
      toast({
        title: "Error",
        description: "Failed to update groomer status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Groomer Management</h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGroomers.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-xl font-medium text-gray-600 mb-1">No groomers found</p>
            <p className="text-gray-500">
              {searchQuery ? 
                "No groomer applications match your search criteria." : 
                "No groomer applications exist in the system yet."}
            </p>
          </div>
        ) : (
          filteredGroomers.map((groomer) => (
            <Card key={groomer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-3">
                      <h3 className="font-semibold text-lg">{groomer.salon_name}</h3>
                      <div className="ml-3">
                        {getStatusBadge(groomer.application_status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                      <p className="text-sm flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-500 mr-1">User:</span> {groomer.email}
                      </p>
                      <p className="text-sm flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-500 mr-1">Contact:</span> {groomer.contact_number}
                      </p>
                      <p className="text-sm flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-500 mr-1">Experience:</span> {groomer.experience_years} years
                      </p>
                      <p className="text-sm flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-500 mr-1">Location:</span> {groomer.address}
                      </p>
                      
                      {groomer.bio && (
                        <p className="text-sm col-span-2 mt-1">
                          <span className="text-gray-500 font-medium">Bio:</span> {groomer.bio}
                        </p>
                      )}
                      
                      <div className="col-span-2 mt-3 border-t pt-3">
                        <div className="flex items-center mb-2">
                          <WalletCards className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">Banking Details</span>
                        </div>
                        
                        {groomer.bank_details ? (
                          <div className="bg-blue-50 rounded-md p-3 mt-1 space-y-1 text-sm">
                            <p><span className="font-medium">Account Name:</span> {groomer.bank_details.account_name}</p>
                            <p><span className="font-medium">Account Number:</span> {groomer.bank_details.account_number}</p>
                            <p><span className="font-medium">IFSC Code:</span> {groomer.bank_details.ifsc_code}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-md p-3 mt-1 text-sm text-gray-600 italic">
                            No banking details provided
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 col-span-2 mt-2">
                        Created: {new Date(groomer.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 col-span-2">
                        ID: {groomer.id}
                      </p>
                      
                      {groomer.admin_notes && (
                        <p className="text-sm col-span-2 mt-2 p-2 bg-yellow-50 rounded-md">
                          <span className="font-medium text-yellow-800">Admin Notes:</span> {groomer.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {groomer.application_status === 'pending' && (
                    <div className="flex gap-2 md:flex-col md:items-end">
                      <Button
                        onClick={() => handleGroomerStatus(groomer.id, 'approved')}
                        className="bg-[#4CAF50] hover:bg-[#3e8e41]"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleGroomerStatus(groomer.id, 'rejected')}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
