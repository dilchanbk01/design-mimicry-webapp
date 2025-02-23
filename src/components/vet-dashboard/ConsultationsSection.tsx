
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface PendingConsultation {
  id: string;
  created_at: string;
}

interface ConsultationsSectionProps {
  pendingConsultations: PendingConsultation[];
  handleConsultation: (consultationId: string, action: 'accept' | 'decline') => void;
}

export function ConsultationsSection({ 
  pendingConsultations, 
  handleConsultation 
}: ConsultationsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Pending Consultations</h2>
      {pendingConsultations.length === 0 ? (
        <p className="text-gray-500">No pending consultation requests</p>
      ) : (
        <div className="space-y-4">
          {pendingConsultations.map((consultation) => (
            <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">New Consultation Request</p>
                <p className="text-sm text-gray-500">
                  Received: {new Date(consultation.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleConsultation(consultation.id, 'accept')}
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                  onClick={() => handleConsultation(consultation.id, 'decline')}
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
