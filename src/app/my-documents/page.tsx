"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/lib/hooks/useServices";
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
import { Document } from "@/lib/types/document";

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { documentService, userService } = useServices();
  const router = useRouter();

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const currentUser = await userService.getCurrentUser();
        
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const userDocuments = await documentService.getUserDocuments(currentUser.id);
        setDocuments(userDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [documentService, userService, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Mes Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez et suivez tous vos documents créés
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Chargement des documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <Card className="max-w-md mx-auto rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun document créé</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Vous n'avez pas encore créé de documents
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Créer un document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col rounded-2xl border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
                <CardHeader className="space-y-2 p-6 pb-4">
                  <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-gray-100">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(doc.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6 pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-6">
                    {doc.summary || doc.content.substring(0, 150) + "..."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Partagé avec {doc.shared_count} utilisateur{doc.shared_count !== 1 ? 's' : ''}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/document-results/${doc.id}`)}
                      className="flex items-center gap-2 group-hover:border-blue-600 group-hover:text-blue-600 dark:group-hover:border-blue-400 dark:group-hover:text-blue-400 transition-colors"
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
    </div>
  );
} 