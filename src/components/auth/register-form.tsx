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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, User, Mail, Lock, Shield } from "lucide-react";

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
  privacyConsent: z.boolean().refine(value => value === true, {
    message: "Vous devez accepter la politique de confidentialité pour créer un compte."
  })
});

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabaseContext();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      privacyConsent: false
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

      // Attendre un peu pour que le trigger handle_new_user() s'exécute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier si l'utilisateur a été créé dans la table users par le trigger
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", authData.user.id)
        .single();

      if (userError) {
        console.error("Erreur lors de la vérification de l'utilisateur:", userError);
        throw new Error("Erreur lors de la création du compte utilisateur");
      }

      if (userData) {
        console.log("Utilisateur créé avec succès par le trigger:", userData);
        
        // Mettre à jour les informations si nécessaire (nom, email, rôle)
        if (userData.name !== values.name || userData.email !== values.email || userData.role !== 'employee') {
          const { error: updateError } = await supabase
            .from("users")
            .update({
              name: values.name,
              email: values.email,
              role: 'employee'
            })
            .eq("id", authData.user.id);

          if (updateError) {
            console.error("Erreur lors de la mise à jour:", updateError);
            // Ne pas faire échouer l'inscription pour une erreur de mise à jour
          }
        }
      }

      // Redirection vers le dashboard après inscription
      // router.push("/dashboard");
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setError(error?.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Vérifiez vos e-mails</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Inscription réussie ! Nous vous avons envoyé un lien de confirmation à votre adresse e-mail.
            Veuillez cliquer sur ce lien pour activer votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Entrez votre nom complet"
                  disabled={isLoading}
                  className="h-11 text-base"
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
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="exemple@email.com"
                  type="email"
                  disabled={isLoading}
                  className="h-11 text-base"
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
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mot de passe
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Créez un mot de passe sécurisé"
                  type="password"
                  disabled={isLoading}
                  className="h-11 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="privacyConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  J'accepte la <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">politique de confidentialité</a>
                </FormLabel>
                <FormDescription className="text-xs text-gray-600 dark:text-gray-400">
                  En cochant cette case, vous acceptez que vos données soient traitées conformément à notre politique de confidentialité.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            "Créer mon compte"
          )}
        </Button>
      </form>
    </Form>
  );
} 