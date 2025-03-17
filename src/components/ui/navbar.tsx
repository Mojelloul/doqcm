"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Home } from "lucide-react";

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabaseContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold text-xl flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            DoQCM
          </Link>
          <div className="hidden md:flex space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/documents" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Mes Documents
              </Link>
            </Button>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          disabled={isLoading}
          className="flex items-center"
        >
          {isLoading ? "Déconnexion..." : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </>
          )}
        </Button>
      </div>
    </nav>
  );
} 