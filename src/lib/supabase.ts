import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chlbvopbvsnjxhmnwxar.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGJ2b3BidnNuanhobW53eGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjA2NjAsImV4cCI6MjA4NzgzNjY2MH0.JTuS5AlWsChzimX5u6nJQkxgN5oK4niOwBPs-gO_tnY';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key starts with:', supabaseAnonKey.substring(0, 10));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
