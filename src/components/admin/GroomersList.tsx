
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, MapPin, Phone, Mail, Clock, DollarSign, User, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Groomer {
  id: string;
  user_id: string;
  salon_name: string;
  address: string;
  contact_number: string;
  experience_years: number;
  application_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  specializations: string[];
  profile_image_url: string | null;
  bio: string | null;
  admin_notes: string | null;
  email?: string;
  provides_home_service: boolean;
  provides_salon_service: boolean;
  home_service_cost: number;
  price: number;
}

interface BankDetails {
  account_name: string;
  account_number: string;
  ifsc_code: string;
}

interface GroomersListProps {
  searchQuery: string;
}

export function GroomersList({ searchQuery }: GroomersListProps) {
  const { toast } = useToast();
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [filteredGroomers, setFilteredGroomers] = useState<Groomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroomer, setSelectedGroomer] = useState<Groomer | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [showBankDetailsDialog, setShowBankDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [showPayoutsDialog, setShowPayoutsDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetchGroomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      filterGroomers(searchQuery);
    } else {
      applyStatusFilter(activeFilter);
    }
  }, [searchQuery, groomers, activeFilter]);

  const fetchGroomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails for each groomer
      if (data) {
        const groomersWithEmail = await Promise.all(
          data.map(async (groomer) => {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', groomer.user_id)
              .single();

            if (userError && userError.code !== 'PGRST116') {
              console.error('Error fetching user data:', userError);
            }

            return {
              ...groomer,
              email: userData?.full_name || 'Unknown user',
            };
          })
        );

        setGroomers(groomersWithEmail);
        applyStatusFilter(activeFilter);
      }
    } catch (error) {
      console.error('Error fetching groomers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groomers data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGroomers = (query: string) => {
    const filtered = groomers.filter(groomer => 
      groomer.salon_name.toLowerCase().includes(query.toLowerCase()) ||
      groomer.address.toLowerCase().includes(query.toLowerCase()) ||
      groomer.contact_number.toLowerCase().includes(query.toLowerCase()) ||
      groomer.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGroomers(filtered);
  };

  const applyStatusFilter = (filter: string) => {
    let filtered;
    if (filter === "all") {
      filtered = groomers;
    } else {
      filtered = groomers.filter(g => g.application_status === filter);
    }

    // Apply search filter if there's a query
    if (searchQuery) {
      filtered = filtered.filter(groomer => 
        groomer.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groomer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groomer.contact_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groomer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredGroomers(filtered);
  };

  const fetchBankDetails = async (groomerId: string) => {
    try {
      const { data, error } = await supabase
        .from('groomer_bank_details')
        .select('*')
        .eq('groomer_id', groomerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBankDetails(data || null);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bank details",
        variant: "destructive",
      });
    }
  };

  const fetchPayoutHistory = async (groomerId: string) => {
    try {
      const { data, error } = await supabase
        .from('groomer_payouts')
        .select('*')
        .eq('groomer_id', groomerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayoutHistory(data || []);
    } catch (error) {
      console.error('Error fetching payout history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout history",
        variant: "destructive",
      });
    }
  };

  const handleViewBankDetails = async (groomer: Groomer) => {
    setSelectedGroomer(groomer);
    await fetchBankDetails(groomer.id);
    setShowBankDetailsDialog(true);
  };

  const handleViewPayoutHistory = async (groomer: Groomer) => {
    setSelectedGroomer(groomer);
    await fetchPayoutHistory(groomer.id);
    setShowPayoutsDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedGroomer || !newStatus) return;

    try {
      const { error } = await supabase
        .from('groomer_profiles')
        .update({ application_status: newStatus })
        .eq('id', selectedGroomer.id);

      if (error) throw error;

      // Update local state
      setGroomers(prevGroomers => 
        prevGroomers.map(g => 
          g.id === selectedGroomer.id 
            ? { ...g, application_status: newStatus }
            : g
        )
      );
      
      setFilteredGroomers(prevFiltered => 
        prevFiltered.map(g => 
          g.id === selectedGroomer.id 
            ? { ...g, application_status: newStatus }
            : g
        )
      );

      toast({
        title: "Status Updated",
        description: `Groomer ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });

      setShowStatusDialog(false);
      setSelectedGroomer(null);
      setNewStatus(null);
    } catch (error) {
      console.error('Error updating groomer status:', error);
      toast({
        title: "Error",
        description: "Failed to update groomer status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Scissors className="h-5 w-5 mr-2 text-purple-600" />
          Groomers Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveFilter}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Groomers</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredGroomers.length === 0 ? (
            <div className="text-center py-8">
              <Scissors className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                {searchQuery 
                  ? "No groomers matching your search" 
                  : `No ${activeFilter === 'all' ? '' : activeFilter} groomers found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroomers.map(groomer => (
                <div 
                  key={groomer.id}
                  className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{groomer.salon_name}</h3>
                        {getStatusBadge(groomer.application_status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                        <p className="text-sm flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" /> 
                          {groomer.address}
                        </p>
                        <p className="text-sm flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" /> 
                          {groomer.contact_number}
                        </p>
                        <p className="text-sm flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" /> 
                          {groomer.email}
                        </p>
                        <p className="text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" /> 
                          Experience: {groomer.experience_years} years
                        </p>
                        <p className="text-sm flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" /> 
                          Pricing: ₹{groomer.price} baseline, 
                          {groomer.provides_home_service ? ` ₹${groomer.home_service_cost} home service` : ' No home service'}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500 mr-1">Specializations:</span> 
                          {groomer.specializations.join(', ')}
                        </p>
                      </div>

                      {groomer.bio && (
                        <p className="text-sm mt-2 text-gray-600 line-clamp-2">
                          <span className="font-medium">Bio:</span> {groomer.bio}
                        </p>
                      )}

                      {groomer.admin_notes && (
                        <p className="text-sm mt-1 text-red-600 italic">
                          <span className="font-medium">Admin Notes:</span> {groomer.admin_notes}
                        </p>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        Applied on {format(new Date(groomer.created_at), 'PPP')}
                      </div>
                    </div>
                    
                    <div className="mt-3 lg:mt-0 flex flex-wrap lg:flex-col gap-2 self-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewBankDetails(groomer)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Bank Details
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewPayoutHistory(groomer)}
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        Payout History
                      </Button>

                      {groomer.application_status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedGroomer(groomer);
                              setNewStatus('rejected');
                              setShowStatusDialog(true);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedGroomer(groomer);
                              setNewStatus('approved');
                              setShowStatusDialog(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>

      {/* Bank Details Dialog */}
      <AlertDialog open={showBankDetailsDialog} onOpenChange={setShowBankDetailsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bank Details - {selectedGroomer?.salon_name}</AlertDialogTitle>
          </AlertDialogHeader>
          {bankDetails ? (
            <div className="space-y-4">
              <div className="border p-3 rounded-md bg-gray-50">
                <p className="mb-2"><span className="font-medium">Account Name:</span> {bankDetails.account_name}</p>
                <p className="mb-2"><span className="font-medium">Account Number:</span> {bankDetails.account_number}</p>
                <p><span className="font-medium">IFSC Code:</span> {bankDetails.ifsc_code}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <p>Account holder: {bankDetails.account_name}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No bank details found for this groomer.</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === 'approved' ? 'Approve' : 'Reject'} Groomer Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {newStatus === 'approved' ? 'approve' : 'reject'} the application from {selectedGroomer?.salon_name}?
              
              {newStatus === 'approved' ? (
                <p className="mt-2">This will allow them to receive bookings on the platform.</p>
              ) : (
                <p className="mt-2">They will need to reapply or contact support if rejected.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus();
              }}
              className={newStatus === 'approved' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {newStatus === 'approved' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payout History Dialog */}
      <AlertDialog open={showPayoutsDialog} onOpenChange={setShowPayoutsDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Payout History - {selectedGroomer?.salon_name}</AlertDialogTitle>
          </AlertDialogHeader>
          {payoutHistory.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="border p-3 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">₹{payout.amount.toFixed(2)}</div>
                    {getPayoutStatusBadge(payout.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Requested: {format(new Date(payout.created_at), 'PPP')}</span>
                    </div>
                    {payout.processed_at && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Processed: {format(new Date(payout.processed_at), 'PPP')}</span>
                      </div>
                    )}
                    {payout.week_start && payout.week_end && (
                      <div className="col-span-2 text-gray-600">
                        <span>Period: {format(new Date(payout.week_start), 'MMM d')} - {format(new Date(payout.week_end), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {payout.notes && (
                      <div className="col-span-2 italic text-gray-600">
                        <span>Notes: {payout.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No payout history found for this groomer.</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
