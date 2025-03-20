"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Home, Menu, X, User, Info } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { supabase } = useSupabaseContext();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      if (!supabase) {
        throw new Error("Client Supabase non initialisé");
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/" className="font-bold text-xl flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 bg-white rounded-md"
            />
            DoQCM
          </Link>
          {isLoggedIn && (
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
          )}
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={isLoggedIn ? handleLogout : handleLogin}
            className="hidden md:flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggedIn ? "Déconnexion" : "Login"}
          </Button>
          
          {/* Bouton du menu mobile */}
          {isLoggedIn && (
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
          )}
        </div>
      </div>
      
      {/* Menu mobile */}
      {mobileMenuOpen && isLoggedIn && (
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
                if (isLoggedIn) {
                  handleLogout();
                } else {
                  handleLogin();
                }
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggedIn ? "Déconnexion" : "Login"}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
} 