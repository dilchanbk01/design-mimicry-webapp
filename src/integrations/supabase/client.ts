
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gllffexjqromdcqgoeec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbGZmZXhqcXJvbWRjcWdvZWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzUxOTcsImV4cCI6MjA1NTkxMTE5N30.ufLiVCLNM8pXNT2dleTM6u2Vgt5Q7vDYM8WAlXjUE5E';

export const supabase = createClient(supabaseUrl, supabaseKey);
