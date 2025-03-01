
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Groomer, BankDetails, PayoutHistoryItem } from "./types";

interface UseFetchGroomersReturn {
  groomers: Groomer[];
  loading: boolean;
  fetchGroomers: () => Promise<void>;
  fetchBankDetails: (groomerId: string) => Promise<BankDetails | null>;
  fetchPayoutHistory: (groomerId: string) => Promise<PayoutHistoryItem[]>;
}

export function useFetchGroomers(toast: any): UseFetchGroomersReturn {
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchBankDetails = async (groomerId: string): Promise<BankDetails | null> => {
    try {
      const { data, error } = await supabase
        .from('groomer_bank_details')
        .select('*')
        .eq('groomer_id', groomerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching bank details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bank details",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchPayoutHistory = async (groomerId: string): Promise<PayoutHistoryItem[]> => {
    try {
      const { data, error } = await supabase
        .from('groomer_payouts')
        .select('*')
        .eq('groomer_id', groomerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching payout history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout history",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    groomers,
    loading,
    fetchGroomers,
    fetchBankDetails,
    fetchPayoutHistory
  };
}
