"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabaseContext();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Tentative de connexion avec:", values.email);
      
      // Connexion avec gestion des cookies
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      console.log("Réponse de connexion:", { data, error });

      if (error) {
        console.error("Erreur de connexion:", error);
        throw error;
      }

      if (!data?.user) {
        throw new Error("Aucun utilisateur trouvé après la connexion");
      }

      // Vérifier que la session est bien établie
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la vérification de la session:", sessionError);
        throw sessionError;
      }

      if (!session) {
        throw new Error("La session n'a pas été établie correctement");
      }

      // Forcer la mise à jour des cookies
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      console.log("Session établie:", {
        user: session.user.email,
        expires_at: session.expires_at
      });
      
      // Rafraîchir le routeur pour mettre à jour l'état de la session
      router.refresh();
      
      // Rediriger vers le tableau de bord
      console.log("Connexion réussie, redirection vers /dashboard");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setError(error?.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="exemple@email.com"
                      type="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Pas encore de compte ?{" "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => router.push("/register")}
          >
            S'inscrire
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 