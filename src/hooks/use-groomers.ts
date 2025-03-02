
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GroomerProfile } from "@/pages/pet-grooming/types";

interface BankDetails {
  account_name: string;
  account_number: string;
  ifsc_code: string;
}

export function useGroomers(initialFilter = "all") {
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
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroomers = useCallback(async () => {
    setLoading(true);
    try {
      console.log("useGroomers: Fetching all groomers...");
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching groomers:", error);
        throw error;
      }

      console.log("useGroomers: Groomers data received:", data);

      // Fetch user email for each groomer
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

        console.log("useGroomers: Groomers with email data:", groomersWithEmail);
        setGroomers(groomersWithEmail);
        
        // Apply the active filter now that we have data
        if (activeFilter === 'all') {
          setFilteredGroomers(groomersWithEmail);
        } else {
          const filtered = groomersWithEmail.filter(g => g.application_status === activeFilter);
          setFilteredGroomers(filtered);
        }
      } else {
        console.log("useGroomers: No groomers found");
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
  }, [activeFilter, toast]);

  const filterGroomers = useCallback((query: string) => {
    console.log("useGroomers: Filtering groomers by query:", query);
    const filtered = groomers.filter(groomer => 
      groomer.salon_name.toLowerCase().includes(query.toLowerCase()) ||
      groomer.address.toLowerCase().includes(query.toLowerCase()) ||
      groomer.contact_number.toLowerCase().includes(query.toLowerCase()) ||
      groomer.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGroomers(filtered);
    setSearchQuery(query);
  }, [groomers]);

  const applyStatusFilter = useCallback((filter: string) => {
    console.log("useGroomers: Applying status filter:", filter);
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
    
    console.log("useGroomers: Filtered groomers:", filtered);
    setFilteredGroomers(filtered);
    setActiveFilter(filter);
  }, [groomers, searchQuery]);

  useEffect(() => {
    console.log("useGroomers: Initial fetch");
    fetchGroomers();
    
    // Set up real-time subscription to groomer_profiles changes
    const subscription = supabase
      .channel('admin-groomer-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'groomer_profiles'
      }, (payload) => {
        console.log("useGroomers: Realtime update received:", payload);
        fetchGroomers();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchGroomers]);

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
      console.log(`useGroomers: Updating groomer ${selectedGroomer.id} status to ${newStatus}`);
      
      const { error } = await supabase
        .from('groomer_profiles')
        .update({ application_status: newStatus })
        .eq('id', selectedGroomer.id);

      if (error) throw error;

      // Update local state immediately
      const updatedGroomers = groomers.map(g => 
        g.id === selectedGroomer.id 
          ? { ...g, application_status: newStatus }
          : g
      );
      
      setGroomers(updatedGroomers);
      
      // Update filtered groomers as well
      // This will remove the item from the filtered list if we're on a status-specific tab
      if (activeFilter !== 'all' && activeFilter !== newStatus) {
        setFilteredGroomers(prevFiltered => 
          prevFiltered.filter(g => g.id !== selectedGroomer.id)
        );
      } else {
        setFilteredGroomers(prevFiltered => 
          prevFiltered.map(g => 
            g.id === selectedGroomer.id 
              ? { ...g, application_status: newStatus }
              : g
          )
        );
      }

      toast({
        title: "Status Updated",
        description: `Groomer ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });

      setShowStatusDialog(false);
      setSelectedGroomer(null);
      setNewStatus(null);
      
      // Re-fetch all groomers to get the latest data
      fetchGroomers();
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
    console.log(`useGroomers: Preparing to change status for ${groomer.id} to ${status}`);
    setSelectedGroomer(groomer);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const getPendingCount = useCallback(() => {
    const count = groomers.filter(g => g.application_status === 'pending').length;
    console.log(`useGroomers: Pending count: ${count}`);
    return count;
  }, [groomers]);

  return {
    groomers,
    filteredGroomers,
    loading,
    selectedGroomer,
    bankDetails,
    showBankDetailsDialog,
    setShowBankDetailsDialog,
    showStatusDialog,
    setShowStatusDialog,
    newStatus,
    payoutHistory,
    showPayoutsDialog,
    setShowPayoutsDialog,
    activeFilter,
    searchQuery,
    pendingCount: getPendingCount(),
    fetchGroomers,
    filterGroomers,
    applyStatusFilter,
    handleViewBankDetails,
    handleViewPayoutHistory,
    handleUpdateStatus,
    handleStatusChange
  };
}
