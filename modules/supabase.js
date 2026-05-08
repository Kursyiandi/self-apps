import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://fudtgvdilagckrsowgax.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHRndmRpbGFnY2tyc293Z2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Nzg5NDgsImV4cCI6MjA5MjI1NDk0OH0.cfJhejLd7BWTwUb5_LQL5ZKS-qrZhPY45VuJZsM24Hs';

export const supabase = createClient(supabaseUrl, supabaseKey);