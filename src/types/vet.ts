
export interface VetProfile {
  id: string;
  user_id: string | null;
  clinic_name: string;
  specializations: string[] | null;
  years_of_experience: number;
  bio: string | null;
  address: string;
  license_number: string;
  contact_number: string;
  application_status: 'pending' | 'approved' | 'rejected' | null;
  created_at: string | null;
  is_online: boolean;
}
