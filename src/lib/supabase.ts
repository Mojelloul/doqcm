import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client pour le navigateur avec gestion automatique des tokens
export const createBrowserSupabaseClient = () => {
  return createClientComponentClient();
};

// Client pour le serveur
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 