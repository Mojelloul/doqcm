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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { supabase } = useSupabaseContext();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);
      setError(null);
      
      // Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      console.log("Réponse de signUp:", { authData, authError });

      if (authError) {
        // Gestion spécifique des erreurs d'authentification
        switch (authError.message) {
          case "Email address is invalid":
          case "Email address \"" + values.email + "\" is invalid":
            throw new Error("L'inscription par email n'est pas activée. Veuillez contacter l'administrateur.");
          case "User already registered":
            throw new Error("Un compte existe déjà avec cette adresse email.");
          case "Password should be at least 6 characters":
            throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
          default:
            throw new Error(`Erreur d'authentification: ${authError.message}`);
        }
      }

      if (!authData.user?.id) {
        console.error("Pas d'ID utilisateur dans la réponse:", authData);
        throw new Error("Erreur lors de la création du compte: pas d'ID utilisateur");
      }

      // Ajouter les informations dans la table users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            name: values.name,
            email: values.email
          },
        ])
        .select()
        .single();

      if (userError) {
        console.error("Erreur lors de l'insertion:", userError);
        if (userError.code === "23505") {
          throw new Error("Cette adresse email est déjà utilisée.");
        }
        throw new Error(`Erreur base de données: ${userError.message}`);
      }

      // Redirection simple vers le dashboard après inscription
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setError(error?.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Déjà un compte ?{" "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => router.push("/login")}
          >
            Se connecter
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 