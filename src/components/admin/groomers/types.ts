
export interface BankDetails {
  account_name: string;
  account_number: string;
  ifsc_code: string;
}

export interface Groomer {
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

export interface PayoutHistoryItem {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  processed_at: string | null;
  week_start: string | null;
  week_end: string | null;
  notes: string | null;
}
