"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useSupabaseContext();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        router.push("/dashboard");
      } catch (error) {
        console.error("Erreur lors de l'authentification:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
} 