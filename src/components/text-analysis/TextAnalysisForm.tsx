"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { X, FileText, AlertTriangle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useServices } from "@/lib/hooks/useServices";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Le titre est requis.",
  }),
  text: z.string().min(100, {
    message: "Le texte doit contenir au moins 100 caractères.",
  }).max(3000, {
    message: "Le texte ne doit pas dépasser 3000 caractères.",
  }),
  summary: z.string().max(250, {
    message: "Le résumé ne doit pas dépasser 250 caractères.",
  }),
  emailInput: z.string().optional(),
  aiConsent: z.boolean().refine(value => value === true, {
    message: "Vous devez accepter le traitement par IA pour continuer."
  })
});

type FormData = z.infer<typeof formSchema>;

export function TextAnalysisForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { userService, documentService, qcmService } = useServices();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      text: "",
      summary: "",
      emailInput: "",
      aiConsent: false
    },
  });

  const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const value = input.value.trim();

    if ((event.key === 'Enter' || event.key === ',') && value) {
      event.preventDefault();
      setError(null); // Réinitialiser les erreurs
      
      if (emails.length >= 3) {
        setError("Vous ne pouvez pas ajouter plus de 3 emails");
        return;
      }
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        if (!emails.includes(value)) {
          setEmails([...emails, value]);
        }
        input.value = '';
        form.setValue('emailInput', '');
      } else {
        setError("Veuillez entrer une adresse email valide");
      }
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setError(null); // Réinitialiser les erreurs
    
    try {
      const currentUser = await userService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("Vous devez être connecté pour créer un document");
      }

      // Vérifier si des emails ont été fournis
      if (emails.length === 0) {
        throw new Error("Veuillez ajouter au moins un destinataire");
      }

      // Récupérer les utilisateurs existants
      const existingUsers = await userService.checkUsersExist(emails);
      
      // Identifier les emails qui n'existent pas
      const existingEmails = existingUsers.map(user => user.email);
      const nonExistentEmails = emails.filter(email => !existingEmails.includes(email));
      
      if (nonExistentEmails.length > 0) {
        const emailList = nonExistentEmails.join(', ');
        throw new Error(`Les adresses email suivantes n'existent pas dans notre système : ${emailList}`);
      }

      if (existingUsers.length === 0) {
        throw new Error("Aucun utilisateur trouvé avec les emails fournis");
      }

      // Générer le QCM avec l'IA
      const qcmResult = await qcmService.generateQCMFromText(values.text, values.title, values.summary);
      
      if (!qcmResult || !qcmResult.qcm || qcmResult.qcm.length === 0) {
        throw new Error("Erreur lors de la génération du QCM par l'IA");
      }

      // Créer le document
      console.log("Création du document...");
      const document = await documentService.createDocument({
        title: values.title,
        content: values.text,
        summary: values.summary,
        owner_id: currentUser.id,
      });

      console.log("Document créé:", document.id);

      // Créer les questions et choix
      console.log("Création des questions QCM...");
      const questionsData: { id: string }[] = [];

      for (const qcmQuestion of qcmResult.qcm) {
        // Créer la question
        const question = await qcmService.createQuestion({
          document_id: document.id,
          question: qcmQuestion.question
        });
        
        questionsData.push(question);

        // Créer les choix pour cette question
        const choicesData = Object.entries(qcmQuestion.choices).map(([key, value]) => ({
          question_id: question.id,
          choice: String(value),
          is_correct: key === qcmQuestion.correct_answer
        }));

        await qcmService.createChoices(choicesData);
      }

      console.log("Questions créées:", questionsData.length);

      // Assigner des questions aux utilisateurs
      console.log("Assignation des questions aux utilisateurs...");
      await qcmService.assignQuestionsToUsers(questionsData, existingUsers);

      // Partager le document avec les utilisateurs
      console.log("Partage du document...");
      const userIds = existingUsers.map((user: { id: string }) => user.id);
      console.log("Utilisateurs à partager:", userIds);
      
      await documentService.shareDocument(document.id, userIds);

      console.log("Document partagé avec succès");

      form.reset();
      setEmails([]);

      // Rediriger vers la page my-documents
      setIsSubmitted(true);
      router.push('/my-documents');
      
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      // Afficher un message d'erreur plus spécifique
      let errorMessage = "Une erreur inattendue s'est produite";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Essayer d'extraire le message de différentes propriétés
        errorMessage = error.message || error.error || error.details || error.reason || JSON.stringify(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Création d'un nouveau document</CardTitle>
        <Button
          variant="outline"
          onClick={() => router.push('/documents')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Gérer mes documents
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du document</FormLabel>
                  <FormControl>
                    <Input placeholder="Donnez un nom à votre document..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu du document</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Insérez le contenu à analyser... (entre 100 et 3000 caractères)"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/3000 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> 

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Synthèse du document</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Résumez les points clés de votre document... (maximum 250 caractères)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/250 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinataires du document</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                      {emails.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeEmail(email)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={emails.length >= 3 ? "Nombre maximum de destinataires atteint" : "Ajoutez les adresses email (appuyez sur Entrée ou virgule pour valider)"}
                          onKeyDown={handleEmailKeyDown}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          disabled={emails.length >= 3}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      {emails.length}/3 destinataires ajoutés
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Traitement par intelligence artificielle
                    </FormLabel>
                    <FormDescription>
                      En validant cette option, vous autorisez le traitement de votre document par notre service d'analyse IA.
                      Consultez notre <a href="/privacy" className="underline" target="_blank">politique de confidentialité</a> pour plus de détails.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isSubmitted}
            >
              {isLoading ? "Traitement en cours..." : isSubmitted ? "Document créé avec succès" : "Créer le document"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 