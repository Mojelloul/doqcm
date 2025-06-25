"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useServices } from "@/lib/hooks/useServices";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2, ArrowLeft, User, Calendar, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User as UserType } from "@/lib/types/user";

export default function AccountPage() {
  const { userService } = useServices();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    getUser();
  }, [userService]);

  const downloadData = async () => {
    setIsLoading(true);
    try {
      const userData = await userService.downloadUserData();
      
      // Créer un fichier de données à télécharger
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
        await userService.deleteAccount();
        
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion du compte</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="space-y-8">
          {/* Informations du compte */}
          <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
              <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du compte
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Vos informations personnelles et détails du compte
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date d'inscription</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.created_at ? format(new Date(user.created_at), "d MMMM yyyy", { locale: fr }) : "Non disponible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exportation des données */}
          <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
              <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportation des données
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Téléchargez vos données personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Télécharger mes données</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Exportez toutes vos données personnelles</p>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadData}
                  disabled={isLoading}
                  className="border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Préparation en cours...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Zone de danger */}
          <Card className="rounded-2xl shadow-lg border border-red-200 dark:border-red-800 bg-white/90 dark:bg-gray-900/90 overflow-hidden">
            <CardHeader className="border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
              <CardTitle className="text-xl text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zone de danger
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                Actions irréversibles sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Suppression du compte</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Supprimez définitivement votre compte et toutes vos données
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression en cours...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 