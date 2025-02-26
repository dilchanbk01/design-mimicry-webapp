
export interface GroomerFormData {
  salonName: string;
  experienceYears: string;
  specializations: string[];
  address: string;
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
  address: "",
  contactNumber: "",
  bio: "",
  providesHomeService: false,
  providesSalonService: true,
};
