
export interface PayoutRequest {
  id: string;
  event_id: string;
  organizer_id: string;
  status: string;
  processed_at: string | null;
  created_at: string;
  amount: number | null;
  event_title?: string;
  organizer_name?: string;
  organizer_email?: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
}
