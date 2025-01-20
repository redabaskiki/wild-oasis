import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://cuzuzoixcmvamqacyhtb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1enV6b2l4Y212YW1xYWN5aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyOTc1MTUsImV4cCI6MjA1Mjg3MzUxNX0.xg5nRAmTMyOtZM_zGXsxVVi9WBJZ-ql7OC_b4nYihk8";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;