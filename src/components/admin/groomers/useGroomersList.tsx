
import { useState, useEffect } from "react";
import { Groomer } from "./types";
import { useFetchGroomers } from "./useFetchGroomers";
import { useGroomerFilters } from "./useGroomerFilters";
import { useGroomerDialogs } from "./useGroomerDialogs";
import { getStatusBadge, getPayoutStatusBadge } from "./badgeUtils";

export function useGroomersList(searchQuery: string, toast: any) {
  const {
    groomers,
    loading,
    fetchGroomers,
    fetchBankDetails,
    fetchPayoutHistory
  } = useFetchGroomers(toast);

  const {
    activeFilter,
    setActiveFilter,
    filteredGroomers,
    filterGroomers,
    applyStatusFilter
  } = useGroomerFilters(groomers);

  const {
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
    handleViewBankDetails: viewBankDetails,
    handleViewPayoutHistory: viewPayoutHistory,
    handleUpdateStatus: updateStatus
  } = useGroomerDialogs(toast);

  useEffect(() => {
    if (searchQuery) {
      filterGroomers(searchQuery, groomers);
    } else {
      applyStatusFilter(activeFilter, groomers, "");
    }
  }, [searchQuery, groomers, activeFilter]);

  // Update groomers after status change
  const updateGroomers = (updatedGroomer: Groomer) => {
    const updatedGroomers = groomers.map(g => 
      g.id === updatedGroomer.id ? updatedGroomer : g
    );
    
    applyStatusFilter(activeFilter, updatedGroomers, searchQuery);
  };

  const handleViewBankDetails = async (groomer: Groomer) => {
    await viewBankDetails(groomer, fetchBankDetails);
  };

  const handleViewPayoutHistory = async (groomer: Groomer) => {
    await viewPayoutHistory(groomer, fetchPayoutHistory);
  };

  const handleUpdateStatus = async () => {
    await updateStatus(updateGroomers);
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
