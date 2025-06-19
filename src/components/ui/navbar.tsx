"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabaseContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
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

  // Afficher un état de chargement si le client Supabase n'est pas encore initialisé
  if (isLoading) {
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
          </div>
          <div className="flex items-center">
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

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
              <Button 
                variant={pathname === "/dashboard" ? "default" : "ghost"} 
                asChild
              >
                <Link href="/dashboard" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Tableau de bord
                </Link>
              </Button>
              <Button 
                variant={pathname.startsWith("/documents") ? "default" : "ghost"} 
                asChild
              >
                <Link href="/documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents partagés
                </Link>
              </Button>
              <Button 
                variant={pathname.startsWith("/my-documents") ? "default" : "ghost"} 
                asChild
              >
                <Link href="/my-documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Mes documents
                </Link>
              </Button>
              <Button 
                variant={pathname.startsWith("/account") ? "default" : "ghost"} 
                asChild
              >
                <Link href="/account" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={pathname.startsWith("/privacy") || pathname.startsWith("/legal") ? "default" : "ghost"} 
                    className="flex items-center"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    À propos
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/privacy" className="flex items-center w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Confidentialité
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
            {isLoggedIn ? "Se déconnecter" : "Se connecter"}
          </Button>
          
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
      
      {mobileMenuOpen && isLoggedIn && (
        <div className="md:hidden bg-background border-b">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Button 
              variant={pathname === "/dashboard" ? "default" : "ghost"} 
              asChild 
              className="justify-start"
            >
              <Link href="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Home className="h-4 w-4 mr-2" />
                Tableau de bord
              </Link>
            </Button>
            <Button 
              variant={pathname.startsWith("/documents") ? "default" : "ghost"} 
              asChild 
              className="justify-start"
            >
              <Link href="/documents" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Documents partagés
              </Link>
            </Button>
            <Button 
              variant={pathname.startsWith("/my-documents") ? "default" : "ghost"} 
              asChild 
              className="justify-start"
            >
              <Link href="/my-documents" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Mes documents
              </Link>
            </Button>
            <Button 
              variant={pathname.startsWith("/account") ? "default" : "ghost"} 
              asChild 
              className="justify-start"
            >
              <Link href="/account" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <User className="h-4 w-4 mr-2" />
                Profil
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
} 