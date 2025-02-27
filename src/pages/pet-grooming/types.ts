
export interface GroomingPartner {
  id: string;
  name: string;
  rating: number;
  location: string;
  experience: string;
  price: string;
  image: string;
  providesHomeService: boolean;
  providesSalonService: boolean;
}

export interface GroomerProfile {
  id: string;
  user_id: string;
  salon_name: string;
  address: string;
  contact_number: string;
  experience_years: number;
  application_status: 'pending' | 'approved' | 'rejected';
  bio: string | null;
  price: number;
  provides_home_service: boolean;
  provides_salon_service: boolean;
  specializations: string[];
  created_at: string;
  updated_at: string;
  profile_image_url: string | null;
  home_service_cost: number;
  is_available: boolean;
}
