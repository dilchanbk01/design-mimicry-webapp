
export interface GroomerFormData {
  salonName: string;
  experienceYears: string;
  specializations: string[];
  streetAddress: string;
  city: string;
  pincode: string;
  contactNumber: string;
  bio: string;
  providesHomeService: boolean;
  providesSalonService: boolean;
  profileImage?: File;
  price: number;
  homeServiceCost: number;
}

export const initialFormData: GroomerFormData = {
  salonName: "",
  experienceYears: "",
  specializations: [],
  streetAddress: "",
  city: "",
  pincode: "",
  contactNumber: "",
  bio: "",
  providesHomeService: false,
  providesSalonService: true,
  price: 500, // Default price
  homeServiceCost: 100, // Default home service cost
};
