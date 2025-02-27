
ALTER TABLE public.grooming_bookings
ADD COLUMN IF NOT EXISTS payment_id text;
