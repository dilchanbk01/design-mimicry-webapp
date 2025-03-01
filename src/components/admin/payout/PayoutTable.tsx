
import { PayoutRequest } from "./types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays } from "lucide-react";

interface PayoutTableProps {
  payoutRequests: PayoutRequest[];
  loading: boolean;
  statusFilter: string | null;
  onViewDetails: (request: PayoutRequest) => void;
  onApprove: (request: PayoutRequest) => void;
  onReject: (request: PayoutRequest) => void;
}

export function PayoutTable({
  payoutRequests,
  loading,
  statusFilter,
  onViewDetails,
  onApprove,
  onReject
}: PayoutTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  if (payoutRequests.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-gray-500">No payout requests found{statusFilter ? ` with status: ${statusFilter}` : ''}.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bank Details</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payoutRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.event_title || "Unknown Event"}</TableCell>
              <TableCell>
                {request.organizer_name || "Unknown"}
                {request.organizer_email && (
                  <div className="text-xs text-gray-500">{request.organizer_email}</div>
                )}
              </TableCell>
              <TableCell><StatusBadge status={request.status} /></TableCell>
              <TableCell className="text-sm">
                <div className="font-medium">{request.account_name}</div>
                <div className="text-xs text-gray-500">
                  {request.account_number} • {request.ifsc_code}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewDetails(request)}
                  >
                    Details
                  </Button>
                  {request.status === 'waiting_for_review' && (
                    <>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => onApprove(request)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onReject(request)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
