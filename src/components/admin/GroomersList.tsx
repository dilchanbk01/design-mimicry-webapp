
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Scissors } from "lucide-react";
import { GroomerProfile } from "@/pages/pet-grooming/types";
import { GroomerCard } from "./groomer/GroomerCard";
import { BankDetailsDialog } from "./groomer/BankDetailsDialog";
import { PayoutHistoryDialog } from "./groomer/PayoutHistoryDialog";
import { StatusUpdateDialog } from "./groomer/StatusUpdateDialog";
import { GroomersFilter } from "./groomer/GroomersFilter";
import { EmptyGroomersList } from "./groomer/EmptyGroomersList";

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
  const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
  const [filteredGroomers, setFilteredGroomers] = useState<GroomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroomer, setSelectedGroomer] = useState<GroomerProfile | null>(null);
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
      console.log("Fetching groomers...");
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching groomers:", error);
        throw error;
      }

      console.log("Groomers data received:", data);

      // Fetch user emails for each groomer
      if (data && data.length > 0) {
        const groomersWithEmail = await Promise.all(
          data.map(async (groomer) => {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', groomer.user_id)
              .maybeSingle();

            if (userError) {
              console.error('Error fetching user data:', userError);
            }

            return {
              ...groomer,
              email: userData?.full_name || 'Unknown user',
            };
          })
        );

        console.log("Groomers with email data:", groomersWithEmail);
        setGroomers(groomersWithEmail);
        applyStatusFilter(activeFilter);
      } else {
        console.log("No groomers found");
        setGroomers([]);
        setFilteredGroomers([]);
      }
    } catch (error) {
      console.error('Error in fetchGroomers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groomers data. Please try again.",
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

  const handleRefresh = () => {
    fetchGroomers();
    toast({
      title: "Refreshed",
      description: "Groomer list has been refreshed.",
    });
  };

  const handleViewBankDetails = async (groomer: GroomerProfile) => {
    setSelectedGroomer(groomer);
    await fetchBankDetails(groomer.id);
    setShowBankDetailsDialog(true);
  };

  const handleViewPayoutHistory = async (groomer: GroomerProfile) => {
    setSelectedGroomer(groomer);
    await fetchPayoutHistory(groomer.id);
    setShowPayoutsDialog(true);
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

  const handleStatusChange = (groomer: GroomerProfile, status: 'approved' | 'rejected') => {
    setSelectedGroomer(groomer);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Scissors className="h-5 w-5 mr-2 text-purple-600" />
          Groomers Management
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="ml-auto"
        >
          Refresh List
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveFilter}>
          <GroomersFilter 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredGroomers.length === 0 ? (
            <EmptyGroomersList 
              searchQuery={searchQuery} 
              activeFilter={activeFilter} 
            />
          ) : (
            <div className="space-y-4">
              {filteredGroomers.map(groomer => (
                <GroomerCard
                  key={groomer.id}
                  groomer={groomer}
                  onViewBankDetails={handleViewBankDetails}
                  onViewPayoutHistory={handleViewPayoutHistory}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>

      <BankDetailsDialog
        open={showBankDetailsDialog}
        onOpenChange={setShowBankDetailsDialog}
        selectedGroomer={selectedGroomer}
        bankDetails={bankDetails}
      />

      <StatusUpdateDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        selectedGroomer={selectedGroomer}
        newStatus={newStatus}
        onConfirm={handleUpdateStatus}
      />

      <PayoutHistoryDialog
        open={showPayoutsDialog}
        onOpenChange={setShowPayoutsDialog}
        selectedGroomer={selectedGroomer}
        payoutHistory={payoutHistory}
      />
    </Card>
  );
}
