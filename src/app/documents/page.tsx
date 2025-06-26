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
import Script from "next/script";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Documents partagés
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Consultez et gérez tous vos documents partagés
          </p>
          {/* Encadré pub Vignette Banner */}
          <div className="my-8 flex justify-center">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white dark:bg-gray-900 shadow p-0 overflow-hidden">
              <div className="w-full h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div id="monetag-documents-banner" />
              </div>
              <div className="p-4 text-center text-xs text-gray-400">
                Publicité sponsorisée
              </div>
            </div>
            <Script id="monetag-documents-banner-script" strategy="afterInteractive">
              {`(function(d,z,s){s.src='//stoampaliy.net/400/9494559';try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('stoampaliy.net',9494559,document.createElement('script'))`}
            </Script>
          </div>
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
              <FileText className="h-16 w-16 text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-gray-100">Aucun document partagé</h2>
              <p className="text-muted-foreground text-center mb-6">
                Commencez par créer un nouveau document pour générer des QCM.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 dark:text-gray-300">
                    {doc.summary || "Aucun résumé disponible"}
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full py-3 text-base font-medium mt-auto group-hover:border-blue-600 group-hover:text-blue-600 dark:group-hover:border-blue-400 dark:group-hover:text-blue-400 transition-colors"
                    onClick={() => router.push(`/documents/qcm/${doc.id}`)}
                  >
                    Consulter le document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Carte Direct Link en bas de page */}
        <div className="mt-12 flex justify-center">
          <a
            href="https://otieu.com/4/9494564"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 max-w-xs w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition p-3"
            style={{ textDecoration: "none" }}
          >
            <img
              src="/pub.jpg"
              alt="Offre partenaire"
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <span className="text-blue-700 dark:text-blue-400 font-semibold block mb-1">Offre partenaire</span>
              <span className="text-gray-700 dark:text-gray-300 text-xs">Découvrez nos solutions sponsorisées</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
} 