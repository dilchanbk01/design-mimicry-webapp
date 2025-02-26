
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
};
