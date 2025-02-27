
export interface GroomingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  groomer_id: string;
  created_at: string;
}

export interface ServiceOption {
  type: 'salon' | 'home';
  additionalCost: number;
  selected: boolean;
}
