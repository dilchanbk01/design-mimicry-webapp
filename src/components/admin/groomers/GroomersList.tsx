
import { useState } from "react";
import { useFetchGroomers } from "./useFetchGroomers";
import { GroomerListItem } from "./GroomerListItem";
import { useGroomerDialogs } from "./useGroomerDialogs";
import { useGroomerFilters } from "./useGroomerFilters";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GroomerStatusDialog } from "./GroomerStatusDialog";
import { GroomerBankDetailsDialog } from "./GroomerBankDetailsDialog";
import { GroomerPayoutsDialog } from "./GroomerPayoutsDialog";

export function GroomersList() {
  const { groomers, loading, error, refreshGroomers } = useFetchGroomers();
  const { filteredGroomers, searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useGroomerFilters(groomers);
  const { 
    selectedGroomer,
    isStatusDialogOpen,
    isBankDetailsDialogOpen,
    isPayoutsDialogOpen,
    openStatusDialog,
    openBankDetailsDialog,
    openPayoutsDialog,
    closeStatusDialog,
    closeBankDetailsDialog,
    closePayoutsDialog
  } = useGroomerDialogs();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshGroomers();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading groomers: {error}</p>
        <Button onClick={refreshGroomers} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groomers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button
            size="sm"
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : filteredGroomers.length > 0 ? (
        <div className="space-y-4">
          {filteredGroomers.map((groomer) => (
            <GroomerListItem
              key={groomer.id}
              groomer={groomer}
              onOpenStatusDialog={openStatusDialog}
              onOpenBankDetailsDialog={openBankDetailsDialog}
              onOpenPayoutsDialog={openPayoutsDialog}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No groomer profiles found</p>
        </div>
      )}

      {selectedGroomer && (
        <>
          <GroomerStatusDialog
            groomer={selectedGroomer}
            open={isStatusDialogOpen}
            onClose={closeStatusDialog}
            onStatusUpdated={refreshGroomers}
          />
          <GroomerBankDetailsDialog
            groomer={selectedGroomer}
            open={isBankDetailsDialogOpen}
            onClose={closeBankDetailsDialog}
          />
          <GroomerPayoutsDialog
            groomer={selectedGroomer}
            open={isPayoutsDialogOpen}
            onClose={closePayoutsDialog}
          />
        </>
      )}
    </div>
  );
}
