"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { X, FileText, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { gemini } from "@/lib/gemini";

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
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
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
  const { supabase } = useSupabaseContext();
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
      if (emails.length >= 3) {
        alert("Vous ne pouvez pas ajouter plus de 3 emails");
        return;
      }
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        if (!emails.includes(value)) {
          setEmails([...emails, value]);
        }
        input.value = '';
        form.setValue('emailInput', '');
      } else {
        alert("Veuillez entrer une adresse email valide");
      }
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  async function onSubmit(values: FormData) {
    if (emails.length === 0) {
      alert("Veuillez ajouter au moins 1 adresse email");
      return;
    }

    if (emails.length > 3) {
      alert("Vous ne pouvez pas ajouter plus de 3 emails");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Vous devez être connecté pour enregistrer une analyse");
      }

      // Vérifier si les emails existent dans la table users
      const { data: existingUsers, error: usersError } = await supabase
        .rpc('check_users_exist', { user_emails: emails });

      if (usersError) {
        console.error("Erreur lors de la vérification des utilisateurs:", usersError);
        throw new Error("Erreur lors de la vérification des utilisateurs");
      }

      if (!existingUsers || existingUsers.length === 0) {
        throw new Error("Aucun des emails fournis n'existe dans l'application. Veuillez vérifier les adresses email.");
      }

      // Vérifier si tous les emails fournis existent
      const existingEmails = existingUsers.map((user: { email: string }) => user.email);
      const invalidEmails = emails.filter(email => !existingEmails.includes(email));
      
      if (invalidEmails.length > 0) {
        throw new Error(`Les emails suivants n'existent pas dans l'application : ${invalidEmails.join(', ')}`);
      }

      // Appel à Gemini pour l'analyse
      const prompt = `You are an advanced AI specialized in text analysis and quiz generation.  

### Instructions:  
1. **Analyze the given text:**  
   - Detect the **language** of the text.  
   - Extract the **title** if available.  
   - Summarize the text or highlight key points.  

2. **Generate a Multiple-Choice Quiz (MCQ) based on the text:**  
   - The **questions and answers must be in the same language as the text**.
   - Create exactly 6 questions.
   - Each question must be clear and relevant to the text.
   - Provide **three answer choices (A, B, C)** per question.
   - Only **one answer** should be correct.  
3. **Output format (JSON):**  
   - The result must be returned in a structured JSON format as follows:  

\`\`\`json
{
  "qcm": [
    {
      "question": "Question text in the detected language",
      "choices": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3"
      },
      "correct_answer": "A",
      "justification": "Explanation or reference to the text"
    },
    {
      "question": "Question text in the detected language",
      "choices": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3"
      },
      "correct_answer": "B",
      "justification": "Explanation or reference to the text"
    }
  ]
}
  \`\`\`
  Important Notes:
- The AI must automatically detect the language of the provided text and generate the questions accordingly.
- The instruction must always remain in English, regardless of the text language.
- The justification should explain why the correct answer is valid, using an extract from the text or a short clarification.

Input:
Here is the full text to analyze and transform into a quiz:
[${values.text}]

title:
[${values.title}]

summary:
[${values.summary}]`;

      const result = await gemini.generateJSON<{
        qcm: Array<{
          question: string;
          choices: { A: string; B: string; C: string };
          correct_answer: "A" | "B" | "C";
          justification: string;
        }>;
      }>(prompt);

      // Sauvegarder dans Supabase
      const { data: document, error: documentError } = await supabase
        .from("documents")
        .insert([
          {
            title: values.title,
            content: values.text,
            summary: values.summary,
            owner_id: userData.user.id,
          },
        ])
        .select()
        .single();

      if (documentError) throw documentError;
      if (!document) throw new Error("Erreur lors de la création du document");

      // Sauvegarder les questions et les choix une seule fois pour le document
      const questionsData: { id: string }[] = [];

      // Pour chaque question du QCM
      for (const qcmQuestion of result.qcm) {
        // Créer la question
        const { data: questionData, error: questionError } = await supabase
          .from("qcm_questions")
          .insert([
            {
              document_id: document.id,
              question: qcmQuestion.question
            }
          ])
          .select()
          .single();

        if (questionError) throw questionError;
        if (!questionData) throw new Error("Erreur lors de la création de la question");
        
        questionsData.push(questionData);

        // Créer les choix pour cette question
        const choicesData = Object.entries(qcmQuestion.choices).map(([key, value]) => ({
          question_id: questionData.id,
          choice: value,
          is_correct: key === qcmQuestion.correct_answer
        }));

        const { error: choicesError } = await supabase
          .from("qcm_choices")
          .insert(choicesData);

        if (choicesError) throw choicesError;
      }

      // Sélectionner 3 questions aléatoires pour chaque utilisateur
      const questionsForUsers = existingUsers.map((user: { id: string; email: string }) => {
        // Mélanger les questions et prendre les 3 premières
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5).slice(0, 3);
        
        // Créer les entrées pour users_questions
        return shuffledQuestions.map(question => ({
          user_id: user.id,
          question_id: question.id
        }));
      }).flat(); // Aplatir le tableau pour avoir toutes les entrées

      // Insérer les questions pour chaque utilisateur
      const { error: usersQuestionsError } = await supabase
        .from("users_questions")
        .insert(questionsForUsers);

      if (usersQuestionsError) throw usersQuestionsError;

      // Créer les partages de documents avec les utilisateurs
      const sharingData = existingUsers.map((user: { id: string; email: string }) => ({
        employee_id: user.id,
        document_id: document.id
      }));

      const { error: sharingError } = await supabase
        .from("employees_documents")
        .insert(sharingData);

      if (sharingError) throw sharingError;

      form.reset();
      setEmails([]);

      // Rediriger vers la page my-documents
      setIsSubmitted(true);
      router.push('/my-documents');
      
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Analyse de Texte</CardTitle>
        <Button
          variant="outline"
          onClick={() => router.push('/documents')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Mes Documents
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez un titre..." {...field} />
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
                  <FormLabel>Texte à analyser</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Collez votre texte ici... (100-3000 caractères)"
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
                  <FormLabel>Résumé et points importants</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ajoutez un résumé ou des points importants... (max 250 caractères)"
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
                  <FormLabel>Emails des destinataires (max 3)</FormLabel>
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
                          placeholder={emails.length >= 3 ? "Limite de 3 emails atteinte" : "Entrez les emails (appuyez sur Entrée ou virgule pour ajouter)"}
                          onKeyDown={handleEmailKeyDown}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          disabled={emails.length >= 3}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      {emails.length}/3 emails ajoutés
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
                      J'accepte que mon texte soit traité par un service d'IA
                    </FormLabel>
                    <FormDescription>
                      En cochant cette case, vous acceptez que votre texte soit envoyé à un service d'IA externe pour analyse.
                      Pour plus d'informations, consultez notre <a href="/privacy" className="underline" target="_blank">politique de confidentialité</a>.
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
              {isLoading ? "Enregistrement..." : isSubmitted ? "Analyse envoyée" : "Enregistrer l'analyse"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 