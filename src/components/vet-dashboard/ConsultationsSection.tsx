
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";

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
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Pending Consultations</h2>
        </div>
        {pendingConsultations.length > 0 && (
          <Badge variant="secondary">
            {pendingConsultations.length} pending
          </Badge>
        )}
      </div>

      {pendingConsultations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No pending consultation requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingConsultations.map((consultation) => (
            <div 
              key={consultation.id} 
              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
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
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                  onClick={() => handleConsultation(consultation.id, 'decline')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
