"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Document {
  id: string;
  title: string;
  created_at: string;
}

interface UserResult {
  user_id: string;
  email: string;
  score: number | null;
  has_taken_test: boolean;
}

export default function DocumentResultsPage() {
  const [document, setDocument] = useState<Document | null>(null);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabaseContext();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  useEffect(() => {
    async function fetchDocumentAndResults() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          router.push('/login');
          return;
        }

        // Récupérer les informations du document
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .select('id, title, created_at')
          .eq('id', documentId)
          .eq('owner_id', userData.user.id)
          .single();

        if (documentError) {
          console.error("Erreur lors de la récupération du document:", documentError);
          router.push('/my-documents');
          return;
        }

        if (!documentData) {
          console.error("Document non trouvé ou vous n'êtes pas le propriétaire");
          router.push('/my-documents');
          return;
        }

        setDocument(documentData);

        // Récupérer les utilisateurs liés au document et leurs scores
        const { data: resultsData, error: resultsError } = await supabase
          .from('employees_documents')
          .select('employee_id, score')
          .eq('document_id', documentId);

        if (resultsError) {
          console.error("Erreur lors de la récupération des résultats:", resultsError);
          throw resultsError;
        }

        // Traiter les résultats
        if (resultsData && resultsData.length > 0) {
          const formattedResults = [];
          
          // Récupérer les emails des utilisateurs
          const userIds = resultsData.map(result => result.employee_id);
          
          if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, email')
              .in('id', userIds);

            if (usersError) {
              console.error("Erreur lors de la récupération des utilisateurs:", usersError);
            }

            // Combiner les données
            for (const result of resultsData) {
              const user = usersData?.find(u => u.id === result.employee_id);
              formattedResults.push({
                user_id: result.employee_id,
                email: user?.email || "Utilisateur inconnu",
                score: result.score,
                has_taken_test: result.score !== null
              });
            }
          }
          
          setUserResults(formattedResults);
        }
      } catch (error) {
        console.error('Error fetching document results:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (documentId) {
      fetchDocumentAndResults();
    }
  }, [supabase, router, documentId]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500 dark:text-gray-400";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Résultats du QCM</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/my-documents')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Suivez les performances de vos utilisateurs sur ce document
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Chargement des résultats...</p>
            </div>
          </div>
        ) : !document ? (
          <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Document non trouvé</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Le document demandé n'existe pas ou vous n'êtes pas autorisé à y accéder
              </p>
              <Button
                onClick={() => router.push('/my-documents')}
                className="py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Retour à mes documents
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8 rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
                <CardTitle className="text-xl sm:text-2xl text-blue-700 dark:text-blue-400">{document.title}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Créé le {format(new Date(document.created_at), "d MMMM yyyy", { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {userResults.length === 0 
                    ? "Aucun utilisateur n'a accès à ce document." 
                    : `Ce document est partagé avec ${userResults.length} utilisateur${userResults.length > 1 ? 's' : ''}.`}
                </p>
              </CardContent>
            </Card>

            {userResults.length > 0 ? (
              <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                          Utilisateur
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {userResults.map((result) => (
                        <tr key={result.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-gray-400 mr-3" />
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {result.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {result.has_taken_test ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Test complété</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">En attente</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${getScoreColor(result.score)}`}>
                              {result.has_taken_test 
                                ? `${result.score}%` 
                                : "Non disponible"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun utilisateur</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                    Ce document n'est partagé avec aucun utilisateur
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Créer un nouveau document
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
} 