
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Groomer, BankDetails, PayoutHistoryItem } from "./types";

interface UseGroomerDialogsReturn {
  selectedGroomer: Groomer | null;
  setSelectedGroomer: (groomer: Groomer | null) => void;
  bankDetails: BankDetails | null;
  setBankDetails: (details: BankDetails | null) => void;
  showBankDetailsDialog: boolean;
  setShowBankDetailsDialog: (value: boolean) => void;
  showStatusDialog: boolean;
  setShowStatusDialog: (value: boolean) => void;
  showPayoutsDialog: boolean;
  setShowPayoutsDialog: (value: boolean) => void;
  payoutHistory: PayoutHistoryItem[];
  setPayoutHistory: (history: PayoutHistoryItem[]) => void;
  newStatus: 'approved' | 'rejected' | null;
  setNewStatus: (status: 'approved' | 'rejected' | null) => void;
  handleViewBankDetails: (groomer: Groomer, fetchBankDetails: (id: string) => Promise<BankDetails | null>) => Promise<void>;
  handleViewPayoutHistory: (groomer: Groomer, fetchPayoutHistory: (id: string) => Promise<PayoutHistoryItem[]>) => Promise<void>;
  handleUpdateStatus: (updateGroomers: (updatedGroomer: Groomer) => void) => Promise<void>;
}

export function useGroomerDialogs(toast: any): UseGroomerDialogsReturn {
  const [selectedGroomer, setSelectedGroomer] = useState<Groomer | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [showBankDetailsDialog, setShowBankDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPayoutsDialog, setShowPayoutsDialog] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([]);
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | null>(null);

  const handleViewBankDetails = async (
    groomer: Groomer, 
    fetchBankDetails: (id: string) => Promise<BankDetails | null>
  ) => {
    setSelectedGroomer(groomer);
    const details = await fetchBankDetails(groomer.id);
    setBankDetails(details);
    setShowBankDetailsDialog(true);
  };

  const handleViewPayoutHistory = async (
    groomer: Groomer,
    fetchPayoutHistory: (id: string) => Promise<PayoutHistoryItem[]>
  ) => {
    setSelectedGroomer(groomer);
    const history = await fetchPayoutHistory(groomer.id);
    setPayoutHistory(history);
    setShowPayoutsDialog(true);
  };

  const handleUpdateStatus = async (updateGroomers: (updatedGroomer: Groomer) => void) => {
    if (!selectedGroomer || !newStatus) return;

    try {
      const { error } = await supabase
        .from('groomer_profiles')
        .update({ application_status: newStatus })
        .eq('id', selectedGroomer.id);

      if (error) throw error;

      // Update the groomer in the local state
      const updatedGroomer = {
        ...selectedGroomer,
        application_status: newStatus
      };
      
      // Call the callback to update groomers in the parent hook
      updateGroomers(updatedGroomer);

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

  return {
    selectedGroomer,
    setSelectedGroomer,
    bankDetails,
    setBankDetails,
    showBankDetailsDialog,
    setShowBankDetailsDialog,
    showStatusDialog,
    setShowStatusDialog,
    showPayoutsDialog,
    setShowPayoutsDialog,
    payoutHistory,
    setPayoutHistory,
    newStatus,
    setNewStatus,
    handleViewBankDetails,
    handleViewPayoutHistory,
    handleUpdateStatus
  };
}
