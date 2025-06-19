"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useServices } from "@/lib/hooks/useServices";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User } from "@/lib/types/user";

export default function AccountPage() {
  const { userService } = useServices();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Gestion du compte</CardTitle>
            <CardDescription className="text-base">
              Gérez vos informations personnelles et vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations du compte</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Date d'inscription</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.created_at ? format(new Date(user.created_at), "d MMMM yyyy", { locale: fr }) : "Non disponible"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Exportation des données</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Télécharger mes données</p>
                    <p className="text-sm text-muted-foreground">Exportez toutes vos données personnelles</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={downloadData}
                    disabled={isLoading}
                    className="group-hover:border-primary group-hover:text-primary"
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
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive">Zone de danger</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div>
                    <p className="text-sm font-medium text-destructive">Suppression du compte</p>
                    <p className="text-sm text-muted-foreground">
                      Supprimez définitivement votre compte et toutes vos données
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={deleteAccount}
                    disabled={isLoading}
                    className="group-hover:bg-destructive/90"
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 