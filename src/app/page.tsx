"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, BookOpen, Award, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Bienvenue sur <span className="text-blue-600">DoQCM</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La plateforme intelligente qui transforme vos documents en tests QCM interactifs pour une évaluation efficace des connaissances.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => router.push("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push("/register")}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-lg"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Comment fonctionne DoQCM ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Importez votre document</h3>
              <p className="text-gray-600">
                Téléchargez ou collez le contenu de votre document dans notre plateforme. Notre système prend en charge divers formats de texte.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Génération automatique</h3>
              <p className="text-gray-600">
                Notre IA analyse le contenu et génère automatiquement des questions à choix multiples pertinentes basées sur les informations clés. Chaque utilisateur recevra des questions différentes pour une évaluation personnalisée.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Partagez et évaluez</h3>
              <p className="text-gray-600">
                Partagez le QCM avec vos collaborateurs ou étudiants et suivez leurs résultats pour évaluer leur compréhension du document.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Pourquoi choisir DoQCM ?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Gain de temps considérable</h3>
                <p className="text-gray-600">
                  Créez des QCM en quelques secondes au lieu de passer des heures à les rédiger manuellement.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Questions pertinentes</h3>
                <p className="text-gray-600">
                  Notre IA identifie les concepts clés et génère des questions qui testent véritablement la compréhension.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Suivi des performances</h3>
                <p className="text-gray-600">
                  Analysez les résultats pour identifier les lacunes de compréhension et adapter votre formation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Évaluation personnalisée</h3>
                <p className="text-gray-600">
                  Chaque utilisateur reçoit des questions uniques et différentes, garantissant une évaluation équitable et adaptée à chacun.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Interface intuitive</h3>
                <p className="text-gray-600">
                  Une expérience utilisateur fluide et agréable, accessible sur tous les appareils.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à transformer vos documents en QCM interactifs ?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Rejoignez des milliers d'utilisateurs qui optimisent leur processus d'évaluation avec DoQCM.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => router.push("/register")}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-lg"
          >
            Créer un compte gratuit
          </Button>
        </div>
      </section>
    </div>
  );
}
