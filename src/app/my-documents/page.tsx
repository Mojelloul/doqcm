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
import { FileText, Calendar, Plus, Users, BarChart } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  created_at: string;
  shared_count?: number;
}

export default function MyDocumentsPage() {
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

        // Récupérer les documents créés par l'utilisateur
        const { data, error } = await supabase
          .from('documents')
          .select('*, employees_documents(document_id)')
          .eq('owner_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transformer les données pour correspondre à notre interface
        const formattedData = data ? data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary,
          created_at: item.created_at,
          shared_count: item.employees_documents ? item.employees_documents.length : 0
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
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes Documents Créés</h1>
        <Button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Créer un document
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Chargement des documents...</div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">Aucun document créé</p>
            <p className="text-sm text-gray-500 mt-1">
              Vous n'avez pas encore créé de documents
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              Créer un document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(doc.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                  {doc.summary || doc.content.substring(0, 150) + "..."}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Partagé avec {doc.shared_count} utilisateur{doc.shared_count !== 1 ? 's' : ''}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/document-results/${doc.id}`)}
                    className="flex items-center gap-1"
                  >
                    <BarChart className="h-4 w-4" />
                    Résultats
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 