"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Home, Menu, X, User, Info, Shield, BookOpen } from "lucide-react";
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
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/" className="font-bold text-xl flex items-center text-blue-700 dark:text-blue-400">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 bg-white rounded-lg shadow-sm mr-2"
              />
              DoQCM
            </Link>
          </div>
          <div className="flex items-center">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded-lg"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <ThemeToggle />
          <Link href="/" className="font-bold text-xl flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 bg-white rounded-lg shadow-sm mr-2"
            />
            DoQCM
          </Link>
          {isLoggedIn && (
            <div className="hidden md:flex space-x-1">
              <Button 
                variant={pathname === "/dashboard" ? "default" : "ghost"} 
                asChild
                className="px-4 py-2 rounded-lg font-medium"
              >
                <Link href="/dashboard" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Tableau de bord
                </Link>
              </Button>
              <Button 
                variant={pathname.startsWith("/documents") ? "default" : "ghost"} 
                asChild
                className="px-4 py-2 rounded-lg font-medium"
              >
                <Link href="/documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents partagés
                </Link>
              </Button>
              <Button 
                variant={pathname.startsWith("/my-documents") ? "default" : "ghost"} 
                asChild
                className="px-4 py-2 rounded-lg font-medium"
              >
                <Link href="/my-documents" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mes documents
                </Link>
              </Button>
              <Button 
                variant={pathname.startsWith("/account") ? "default" : "ghost"} 
                asChild
                className="px-4 py-2 rounded-lg font-medium"
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
                    className="flex items-center px-4 py-2 rounded-lg font-medium"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    À propos
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                  <DropdownMenuItem asChild className="rounded-md">
                    <Link href="/privacy" className="flex items-center w-full p-2">
                      <Shield className="h-4 w-4 mr-2" />
                      Confidentialité
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md">
                    <Link href="/legal" className="flex items-center w-full p-2">
                      <FileText className="h-4 w-4 mr-2" />
                      Mentions légales
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={isLoggedIn ? handleLogout : handleLogin}
            className="hidden md:flex items-center px-4 py-2 rounded-lg font-medium border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggedIn ? "Se déconnecter" : "Se connecter"}
          </Button>
          
          {isLoggedIn && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-lg" 
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
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col space-y-2">
            <Button 
              variant={pathname === "/dashboard" ? "default" : "ghost"} 
              asChild 
              className="justify-start rounded-lg font-medium"
            >
              <Link href="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Home className="h-4 w-4 mr-3" />
                Tableau de bord
              </Link>
            </Button>
            <Button 
              variant={pathname.startsWith("/documents") ? "default" : "ghost"} 
              asChild 
              className="justify-start rounded-lg font-medium"
            >
              <Link href="/documents" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-4 w-4 mr-3" />
                Documents partagés
              </Link>
            </Button>
            <Button 
              variant={pathname.startsWith("/my-documents") ? "default" : "ghost"} 
              asChild 
              className="justify-start rounded-lg font-medium"
            >
              <Link href="/my-documents" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <BookOpen className="h-4 w-4 mr-3" />
                Mes documents
              </Link>
            </Button>
            <Button 
              variant={pathname.startsWith("/account") ? "default" : "ghost"} 
              asChild 
              className="justify-start rounded-lg font-medium"
            >
              <Link href="/account" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <User className="h-4 w-4 mr-3" />
                Profil
              </Link>
            </Button>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="justify-start rounded-lg font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 