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
    if (score === null) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Résultats du QCM</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/my-documents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Chargement des résultats...</div>
      ) : !document ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">Document non trouvé</p>
            <p className="text-sm text-gray-500 mt-1">
              Le document demandé n'existe pas ou vous n'êtes pas autorisé à y accéder
            </p>
            <Button
              onClick={() => router.push('/my-documents')}
              className="mt-4"
            >
              Retour à mes documents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{document.title}</CardTitle>
              <CardDescription>
                Créé le {format(new Date(document.created_at), "d MMMM yyyy", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {userResults.length === 0 
                  ? "Aucun utilisateur n'a accès à ce document." 
                  : `Ce document est partagé avec ${userResults.length} utilisateur${userResults.length > 1 ? 's' : ''}.`}
              </p>
            </CardContent>
          </Card>

          {userResults.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userResults.map((result) => (
                      <tr key={result.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-sm font-medium text-gray-900">
                              {result.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {result.has_taken_test ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <span className="text-sm text-green-600">Test complété</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-500">En attente</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getScoreColor(result.score)}`}>
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
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <User className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">Aucun utilisateur</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ce document n'est partagé avec aucun utilisateur
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4"
                >
                  Créer un nouveau document
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 