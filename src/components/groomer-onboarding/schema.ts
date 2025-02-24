
export interface GroomerFormData {
  salonName: string;
  experienceYears: string;
  specializations: string[];
  address: string;
  contactNumber: string;
  bio: string;
}

export const initialFormData: GroomerFormData = {
  salonName: "",
  experienceYears: "",
  specializations: [],
  address: "",
  contactNumber: "",
  bio: ""
};
