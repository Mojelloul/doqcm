"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { supabase } = useSupabaseContext();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user) {
          // Si l'utilisateur est déjà connecté, rediriger vers la page des documents
          router.push("/documents");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-blue-700 dark:text-blue-400">Créer un compte</CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            Rejoignez DoQCM pour générer, partager et suivre vos QCM en toute simplicité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-3 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3 text-base font-medium border-gray-300 dark:border-gray-600"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`
                }
              });
              if (error) console.error('Erreur de connexion Google:', error);
            }}
          >
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <g>
                <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504c-68.4 0-130.1-24.5-178.1-65.2l72.2-59.2c19.5 13.1 44.5 20.7 70.9 20.7 54.1 0 99.9-36.5 116.2-85.7H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                <path fill="#34A853" d="M248 504c66.8 0 123-24.5 166.3-64.9l-67.5-64.9c-19.5 13.1-44.5 20.7-70.9 20.7-54.1 0-99.9-36.5-116.2-85.7H248v-85.3H11.9C4.2 232.1 0 243.7 0 256c0 137.2 110.8 248 248 248z"/>
                <path fill="#4A90E2" d="M94.3 256c0-86.5 69.1-156.6 153.7-156.6 44.1 0 81.7 15.2 108.2 40.2l81.2-81.2C391.1 7.9 324.7 0 248 0 110.8 0 0 110.8 0 248c0 12.3 4.2 23.9 11.9 34.1l82.4-68.1c-1.1-6.7-1.7-13.6-1.7-20.1z"/>
                <path fill="#FBBC05" d="M488 261.8c0-15.1-1.6-29.7-4.6-43.7H248v85.3h116.2c-8.1 22.2-25.7 41.1-48.2 53.6l72.2 59.2C453.8 393.2 488 332.7 488 261.8z"/>
              </g>
            </svg>
            Continuer avec Google
          </Button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            Nous ne partageons jamais vos données personnelles. L'inscription est 100% sécurisée.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Retour à l&apos;accueil
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 