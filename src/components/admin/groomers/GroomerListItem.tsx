
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

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

interface GroomerListItemProps {
  groomer: Groomer;
  getStatusBadge: (status: string) => React.ReactNode;
  onViewBankDetails: (groomer: Groomer) => void;
  onViewPayoutHistory: (groomer: Groomer) => void;
  setSelectedGroomer: (groomer: Groomer) => void;
  setNewStatus: (status: 'approved' | 'rejected' | null) => void;
  setShowStatusDialog: (show: boolean) => void;
}

export function GroomerListItem({
  groomer,
  getStatusBadge,
  onViewBankDetails,
  onViewPayoutHistory,
  setSelectedGroomer,
  setNewStatus,
  setShowStatusDialog
}: GroomerListItemProps) {
  return (
    <div 
      key={groomer.id}
      className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{groomer.salon_name}</h3>
            {getStatusBadge(groomer.application_status)}
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
              {groomer.email}
            </p>
            <p className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" /> 
              Experience: {groomer.experience_years} years
            </p>
            <p className="text-sm flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-gray-400" /> 
              Pricing: ₹{groomer.price} baseline, 
              {groomer.provides_home_service ? ` ₹${groomer.home_service_cost} home service` : ' No home service'}
            </p>
            <p className="text-sm">
              <span className="text-gray-500 mr-1">Specializations:</span> 
              {groomer.specializations.join(', ')}
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

          {groomer.application_status === 'pending' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedGroomer(groomer);
                  setNewStatus('rejected');
                  setShowStatusDialog(true);
                }}
                className="text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  setSelectedGroomer(groomer);
                  setNewStatus('approved');
                  setShowStatusDialog(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
