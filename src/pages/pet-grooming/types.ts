
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
  application_status: string;
  created_at: string;
  specializations: string[];
  profile_image_url: string | null;
  bio: string | null;
  admin_notes: string | null;
  provides_home_service: boolean;
  provides_salon_service: boolean;
  price: number;
  home_service_cost: number;
  is_available?: boolean;
}

export interface BookingFormData {
  petName: string;
  petType: string;
  petBreed: string;
  date: Date | undefined;
  time: string;
  serviceType: 'salon' | 'home';
  address?: string;
}
