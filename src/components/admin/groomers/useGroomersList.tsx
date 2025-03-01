
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface BankDetails {
  account_name: string;
  account_number: string;
  ifsc_code: string;
}

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

interface UseGroomersListReturn {
  groomers: Groomer[];
  filteredGroomers: Groomer[];
  loading: boolean;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  selectedGroomer: Groomer | null;
  setSelectedGroomer: (groomer: Groomer | null) => void;
  bankDetails: BankDetails | null;
  showBankDetailsDialog: boolean;
  setShowBankDetailsDialog: (value: boolean) => void;
  showStatusDialog: boolean;
  setShowStatusDialog: (value: boolean) => void;
  showPayoutsDialog: boolean;
  setShowPayoutsDialog: (value: boolean) => void;
  payoutHistory: any[];
  newStatus: 'approved' | 'rejected' | null;
  setNewStatus: (status: 'approved' | 'rejected' | null) => void;
  fetchGroomers: () => Promise<void>;
  handleViewBankDetails: (groomer: Groomer) => Promise<void>;
  handleViewPayoutHistory: (groomer: Groomer) => Promise<void>;
  handleUpdateStatus: () => Promise<void>;
  getStatusBadge: (status: string) => JSX.Element;
  getPayoutStatusBadge: (status: string) => JSX.Element;
}

export function useGroomersList(searchQuery: string, toast: any): UseGroomersListReturn {
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
        console.log("Fetched groomer profiles:", data);
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
    console.log("Applying filter:", filter);
    console.log("Available groomers:", groomers);

    let filtered;
    if (filter === "all") {
      filtered = groomers;
    } else {
      filtered = groomers.filter(g => g.application_status === filter);
    }

    console.log("Filtered groomers:", filtered);

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

  return {
    groomers,
    filteredGroomers,
    loading,
    activeFilter,
    setActiveFilter,
    selectedGroomer,
    setSelectedGroomer,
    bankDetails,
    showBankDetailsDialog,
    setShowBankDetailsDialog,
    showStatusDialog,
    setShowStatusDialog,
    showPayoutsDialog, 
    setShowPayoutsDialog,
    payoutHistory,
    newStatus,
    setNewStatus,
    fetchGroomers,
    handleViewBankDetails,
    handleViewPayoutHistory,
    handleUpdateStatus,
    getStatusBadge,
    getPayoutStatusBadge
  };
}
