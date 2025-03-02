
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scissors, MapPin, Phone, Mail, Clock, DollarSign, Check, X } from "lucide-react";
import { format } from "date-fns";
import { GroomerProfile } from "@/pages/pet-grooming/types";

interface GroomerCardProps {
  groomer: GroomerProfile;
  onViewBankDetails: (groomer: GroomerProfile) => void;
  onViewPayoutHistory: (groomer: GroomerProfile) => void;
  onStatusChange: (groomer: GroomerProfile, newStatus: 'approved' | 'rejected') => void;
}

export function GroomerCard({ 
  groomer, 
  onViewBankDetails, 
  onViewPayoutHistory, 
  onStatusChange 
}: GroomerCardProps) {
  // Track application status in local state to ensure UI consistency
  const [applicationStatus, setApplicationStatus] = useState(groomer.application_status);
  
  // Update local state when groomer prop changes
  useEffect(() => {
    setApplicationStatus(groomer.application_status);
  }, [groomer.application_status]);

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

  // Explicitly check if the application is pending
  const isPending = applicationStatus === 'pending';
  
  console.log("GroomerCard:", { 
    groomerId: groomer.id, 
    status: groomer.application_status, 
    localStatus: applicationStatus,
    isPending
  });

  return (
    <div 
      key={groomer.id}
      className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{groomer.salon_name}</h3>
            {getStatusBadge(applicationStatus)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
            <p className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" /> 
              {groomer.address}
            </p>
            <p className="text-sm flex items-center">
              <Phone className="h-4 w-4 mr-1 text-gray-400" /> 
              {groomer.contact_number}
            </p>
            <p className="text-sm flex items-center">
              <Mail className="h-4 w-4 mr-1 text-gray-400" /> 
              {groomer.email || 'Email not available'}
            </p>
            <p className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" /> 
              Experience: {groomer.experience_years} years
            </p>
            <p className="text-sm flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-gray-400" /> 
              Pricing: ₹{groomer.price || 0} baseline, 
              {groomer.provides_home_service ? ` ₹${groomer.home_service_cost || 0} home service` : ' No home service'}
            </p>
            <p className="text-sm">
              <span className="text-gray-500 mr-1">Specializations:</span> 
              {groomer.specializations && groomer.specializations.length > 0 
                ? groomer.specializations.join(', ') 
                : 'None'}
            </p>
          </div>

          {groomer.bio && (
            <p className="text-sm mt-2 text-gray-600 line-clamp-2">
              <span className="font-medium">Bio:</span> {groomer.bio}
            </p>
          )}

          {groomer.admin_notes && (
            <p className="text-sm mt-1 text-red-600 italic">
              <span className="font-medium">Admin Notes:</span> {groomer.admin_notes}
            </p>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Applied on {format(new Date(groomer.created_at), 'PPP')}
          </div>
        </div>
        
        <div className="mt-3 lg:mt-0 flex flex-wrap lg:flex-col gap-2 self-end">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewBankDetails(groomer)}
            className="text-blue-600 hover:bg-blue-50"
          >
            Bank Details
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewPayoutHistory(groomer)}
            className="text-purple-600 hover:bg-purple-50"
          >
            Payout History
          </Button>

          {/* Directly check application status to render approval/rejection buttons */}
          {isPending && (
            <div className="flex flex-col gap-2 w-full">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  onStatusChange(groomer, 'rejected');
                  // Update local state immediately for UI feedback
                  setApplicationStatus('rejected');
                }}
                className="text-red-600 hover:bg-red-50 flex items-center justify-center w-full"
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  onStatusChange(groomer, 'approved');
                  // Update local state immediately for UI feedback
                  setApplicationStatus('approved');
                }}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center w-full"
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
