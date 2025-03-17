import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client côté serveur
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client côté navigateur (pour les composants client)
export const createBrowserSupabaseClient = () => {
  return createClientComponentClient();
}; 