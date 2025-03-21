"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2 } from "lucide-react";

export default function AccountPage() {
  const { supabase } = useSupabaseContext();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const downloadData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Vous devez être connecté pour télécharger vos données");
      }
      
      // Récupérer tous les documents de l'utilisateur
      const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("owner_id", user.id);
        
      // Récupérer les partages
      const { data: sharedDocuments } = await supabase
        .from("employees_documents")
        .select("document_id")
        .eq("employee_id", user.id);
        
      // Récupérer les QCM
      const { data: qcmQuestions } = await supabase
        .from("qcm_questions")
        .select(`
          id, 
          question, 
          document_id,
          qcm_choices (
            id,
            choice,
            is_correct
          )
        `)
        .in(
          "document_id", 
          documents ? documents.map(doc => doc.id) : []
        );
      
      // Créer un fichier de données à télécharger
      const userData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        documents,
        sharedDocuments,
        qcmQuestions
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      // Téléchargement
      const a = document.createElement("a");
      a.href = url;
      a.download = `mes-donnees-doqcm-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert("Vos données ont été téléchargées avec succès");
    } catch (error: any) {
      console.error("Erreur lors du téléchargement des données:", error);
      alert(error.message || "Une erreur s'est produite lors du téléchargement de vos données");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.")) {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Vous devez être connecté pour supprimer votre compte");
        }
        
        // Supprimer les documents et données associées (les triggers SQL s'occupent de supprimer les données liées)
        const { error: documentsError } = await supabase
          .from("documents")
          .delete()
          .eq("owner_id", user.id);
          
        if (documentsError) throw documentsError;
        
        // Supprimer les partages
        const { error: sharesError } = await supabase
          .from("employees_documents")
          .delete()
          .eq("employee_id", user.id);
          
        if (sharesError) throw sharesError;
        
        // Déconnecter l'utilisateur
        await supabase.auth.signOut();
        
        alert("Votre compte a été supprimé avec succès");
        router.push("/");
      } catch (error: any) {
        console.error("Erreur lors de la suppression du compte:", error);
        alert(error.message || "Une erreur s'est produite lors de la suppression de votre compte");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestion du compte</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Exportation des données</CardTitle>
          <CardDescription>
            Téléchargez l&apos;ensemble de vos données personnelles au format JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Conformément au RGPD, vous pouvez télécharger toutes vos données personnelles. 
            Le fichier contiendra vos informations de compte, vos documents et vos QCM.
          </p>
          <Button 
            onClick={downloadData} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Préparation en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Télécharger mes données
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Zone de danger</CardTitle>
          <CardDescription>
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            La suppression de votre compte entraînera la perte définitive de toutes vos données, 
            y compris vos documents et QCM. Cette action ne peut pas être annulée.
          </p>
          <Button 
            variant="destructive" 
            onClick={deleteAccount} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Suppression en cours...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 