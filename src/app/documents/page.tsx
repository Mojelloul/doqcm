"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabaseContext();
  const router = useRouter();

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          router.push('/login');
          return;
        }

        // Récupérer les documents partagés avec l'utilisateur
        const { data, error } = await supabase
          .from('documents')
          .select('*, employees_documents!inner(document_id, employee_id)')
          .eq('employees_documents.employee_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transformer les données pour correspondre à notre interface
        const formattedData = data ? data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary,
          created_at: item.created_at
        })) : [];
        
        setDocuments(formattedData);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [supabase, router]);

  return (
    <div className="container mx-auto px-2 sm:px-6 py-6 max-w-2xl lg:max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Documents partagés</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Chargement des documents...</p>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-xl font-semibold text-center mb-2">Aucun document partagé</h2>
            <p className="text-muted-foreground text-center mb-6">
              Commencez par créer un nouveau document pour générer des QCM.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 text-base"
            >
              Créer un document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-200 flex flex-col rounded-xl border border-gray-200 bg-white/90 dark:bg-gray-900 dark:border-gray-700">
              <CardHeader className="space-y-1 p-4 pb-2 dark:bg-gray-900">
                <CardTitle className="line-clamp-2 text-base sm:text-lg font-semibold group-hover:text-primary transition-colors dark:text-gray-100">
                  {doc.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs sm:text-sm dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(doc.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4 pt-2 dark:bg-gray-900">
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-4 dark:text-gray-300">
                  {doc.summary || "Aucun résumé disponible"}
                </p>
                <Button 
                  variant="outline"
                  className="w-full py-2 text-base mt-auto group-hover:border-primary group-hover:text-primary transition-colors"
                  onClick={() => router.push(`/documents/qcm/${doc.id}`)}
                >
                  Consulter le document
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 