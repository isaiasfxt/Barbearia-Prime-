import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://chlbvopbvsnjxhmnwxar.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGJ2b3BidnNuanhobW53eGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjA2NjAsImV4cCI6MjA4NzgzNjY2MH0.JTuS5AlWsChzimX5u6nJQkxgN5oK4niOwBPs-gO_tnY';

// Helper to validate URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(import.meta.env.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL
  : DEFAULT_URL;

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.length > 20)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
