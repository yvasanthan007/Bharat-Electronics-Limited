import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

const finalUrl = supabaseUrl?.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(finalUrl, finalKey);
