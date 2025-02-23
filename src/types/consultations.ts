
export interface Consultation {
  id: string;
  user_id: string;
  vet_id: string | null;
  status: 'pending' | 'active' | 'completed' | 'expired';
  rating: number | null;
  created_at: string;
  ended_at: string | null;
  prescription_url: string | null;
}

export interface ConsultationMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  created_at: string;
}
