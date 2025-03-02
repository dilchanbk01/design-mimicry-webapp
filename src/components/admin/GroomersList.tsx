
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Scissors, RefreshCcw } from "lucide-react";
import { GroomerCard } from "./groomer/GroomerCard";
import { BankDetailsDialog } from "./groomer/BankDetailsDialog";
import { PayoutHistoryDialog } from "./groomer/PayoutHistoryDialog";
import { StatusUpdateDialog } from "./groomer/StatusUpdateDialog";
import { GroomersFilter } from "./groomer/GroomersFilter";
import { EmptyGroomersList } from "./groomer/EmptyGroomersList";
import { useGroomers } from "@/hooks/use-groomers";
import { useToast } from "@/hooks/use-toast";

interface GroomersListProps {
  searchQuery: string;
}

export function GroomersList({ searchQuery }: GroomersListProps) {
  const { toast } = useToast();
  const {
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
    pendingCount,
    fetchGroomers,
    filterGroomers,
    applyStatusFilter,
    handleViewBankDetails,
    handleViewPayoutHistory,
    handleUpdateStatus,
    handleStatusChange
  } = useGroomers();

  // Force a re-fetch on mount to ensure we have the latest data
  useEffect(() => {
    console.log("GroomersList: Fetching groomers on mount");
    fetchGroomers();
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use useCallback to prevent re-creation of the function on each render
  const memoizedFilterGroomers = useCallback((query: string) => {
    console.log("GroomersList: Applying search filter:", query);
    if (query) {
      filterGroomers(query);
    } else {
      // If no query, apply the current active filter
      applyStatusFilter(activeFilter);
    }
  }, [filterGroomers, applyStatusFilter, activeFilter]);

  // Initialize search filtering when searchQuery prop changes
  useEffect(() => {
    memoizedFilterGroomers(searchQuery);
  }, [searchQuery, memoizedFilterGroomers]);

  const handleRefresh = () => {
    console.log("GroomersList: Manual refresh triggered");
    fetchGroomers();
    toast({
      title: "Refreshed",
      description: "Groomer list has been refreshed.",
    });
  };

  console.log("GroomersList render:", { 
    filteredGroomers, 
    activeFilter, 
    pendingCount,
    totalGroomers: groomers.length
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-purple-600" />
            Groomers Management
          </CardTitle>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
              {pendingCount} pending application{pendingCount !== 1 && 's'}
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={applyStatusFilter}>
          <GroomersFilter 
            activeFilter={activeFilter} 
            onFilterChange={applyStatusFilter} 
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
