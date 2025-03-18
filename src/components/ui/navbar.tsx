"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Home, Menu, X, User, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { supabase } = useSupabaseContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      // Vérifier si une session existe avant de se déconnecter
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Supprimer la session et les cookies
        await supabase.auth.signOut();
        // Rediriger vers la page de connexion
        router.push("/login");
        // Forcer un rechargement de la page pour nettoyer l'état
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
                Docs Partagés
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/my-documents" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Mes Créations
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/account" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Mon Compte
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Informations
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/privacy" className="flex items-center w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Politique de confidentialité
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="flex items-center w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Mentions légales
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            disabled={isLoading}
            className="hidden md:flex items-center"
          >
            {isLoading ? "Déconnexion..." : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </>
            )}
          </Button>
          
          {/* Bouton du menu mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/documents" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Docs Partagés
              </Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/my-documents" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Mes Créations
              </Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/account" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <User className="h-4 w-4 mr-2" />
                Mon Compte
              </Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/privacy" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Politique de confidentialité
              </Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/legal" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Mentions légales
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }} 
              disabled={isLoading}
              className="flex items-center justify-start"
            >
              {isLoading ? "Déconnexion..." : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
} 