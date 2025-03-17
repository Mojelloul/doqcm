"use client";

import { createContext, useContext, type ReactNode, useState, useEffect } from "react";
import { supabase, createBrowserSupabaseClient } from "@/lib/supabase";
import { type SupabaseClient } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    // Initialiser le client Supabase côté navigateur
    const browserClient = createBrowserSupabaseClient();
    setClient(browserClient);
  }, []);

  // Attendre que le client soit initialisé
  if (!client) {
    return <div>Chargement...</div>;
  }

  return (
    <SupabaseContext.Provider value={{ supabase: client }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
} 