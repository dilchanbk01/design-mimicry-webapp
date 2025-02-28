
export interface GroomerBankDetails {
  account_name: string;
  account_number: string;
  ifsc_code: string;
}

export interface PayoutRequest {
  id: string;
  groomer_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
}
