
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
import { GroomerListItem } from "./groomers/GroomerListItem";
import { GroomerBankDetailsDialog } from "./groomers/GroomerBankDetailsDialog";
import { GroomerStatusDialog } from "./groomers/GroomerStatusDialog";
import { GroomerPayoutsDialog } from "./groomers/GroomerPayoutsDialog";
import { useGroomersList } from "./groomers/useGroomersList";

interface GroomersListProps {
  searchQuery: string;
}

export function GroomersList({ searchQuery }: GroomersListProps) {
  const { toast } = useToast();
  const {
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
  } = useGroomersList(searchQuery, toast);

  useEffect(() => {
    fetchGroomers();
  }, []);

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
                <GroomerListItem
                  key={groomer.id}
                  groomer={groomer}
                  getStatusBadge={getStatusBadge}
                  onViewBankDetails={handleViewBankDetails}
                  onViewPayoutHistory={handleViewPayoutHistory}
                  setSelectedGroomer={setSelectedGroomer}
                  setNewStatus={setNewStatus}
                  setShowStatusDialog={setShowStatusDialog}
                />
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>

      {/* Bank Details Dialog */}
      <GroomerBankDetailsDialog
        open={showBankDetailsDialog}
        onOpenChange={setShowBankDetailsDialog}
        selectedGroomer={selectedGroomer}
        bankDetails={bankDetails}
      />

      {/* Status Update Dialog */}
      <GroomerStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        selectedGroomer={selectedGroomer}
        newStatus={newStatus}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Payout History Dialog */}
      <GroomerPayoutsDialog
        open={showPayoutsDialog}
        onOpenChange={setShowPayoutsDialog}
        selectedGroomer={selectedGroomer}
        payoutHistory={payoutHistory}
        getStatusBadge={getPayoutStatusBadge}
      />
    </Card>
  );
}
