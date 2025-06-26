"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, BookOpen, Award, ArrowRight } from "lucide-react";
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-2 sm:px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            {/* <div className="inline-flex items-center justify-center p-3 rounded-full mb-6">
              <Image
                src="/logo.png"
                alt="Logo DoQCM"
                width={40}
                height={40}
                className="bg-white rounded-full"
              />
            </div> */}
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Plateforme professionnelle de <span className="text-blue-600 dark:text-blue-400">gestion de QCM</span>
            </h1>
            <p className="text-lg text-blue-700 dark:text-blue-300 font-semibold mb-2">Prenez une photo d'un texte, obtenez un QCM en 1 clic !</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-2 sm:px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-white/90 dark:bg-gray-900/80 p-4 sm:p-6 rounded-xl shadow">
              <div className="bg-blue-100 dark:bg-blue-800 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 dark:text-white">1. Import de documents</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-1 font-medium">Prenez une photo d'un texte imprimé ou manuscrit, DoQCM s'occupe du reste !</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/80 p-4 sm:p-6 rounded-xl shadow">
              <div className="bg-blue-100 dark:bg-blue-800 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 dark:text-white">2. Génération automatique</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-1 font-medium">L'IA transforme instantanément vos documents en QCM prêts à l'emploi.</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/80 p-4 sm:p-6 rounded-xl shadow">
              <div className="bg-blue-100 dark:bg-blue-800 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 dark:text-white">3. Gestion avancée</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-1 font-medium">Partagez, suivez les résultats et gagnez du temps sur la correction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 px-2 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">
            Pourquoi choisir DoQCM ?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 dark:text-green-400 mr-3 sm:mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 dark:text-white">Gain de temps considérable</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Optimisez votre productivité en générant des QCM en quelques secondes, évitant ainsi des heures de rédaction manuelle.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 dark:text-green-400 mr-3 sm:mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 dark:text-white">Questions pertinentes</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Notre intelligence artificielle analyse les concepts clés pour générer des questions ciblées et pertinentes.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 dark:text-green-400 mr-3 sm:mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 dark:text-white">Suivi des performances</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Analysez les résultats détaillés pour identifier les points d&apos;amélioration et optimiser votre formation.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 dark:text-green-400 mr-3 sm:mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 dark:text-white">Évaluation personnalisée</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Chaque participant reçoit un ensemble unique de questions, garantissant une évaluation objective et individualisée.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 dark:text-green-400 mr-3 sm:mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 dark:text-white">Interface intuitive</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Une expérience utilisateur optimisée et responsive, accessible sur tous les appareils.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-2 sm:px-4 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Optimisez votre processus d&apos;évaluation
          </h2>
          <p className="text-base sm:text-xl mb-8 sm:mb-10 opacity-90">
            Rejoignez notre communauté de professionnels qui transforment leur approche pédagogique avec DoQCM.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => router.push("/register")}
            className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-800 dark:hover:bg-gray-200 px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg w-full sm:w-auto"
          >
            Créer un compte
          </Button>
        </div>
      </section>
    </div>
  );
}
