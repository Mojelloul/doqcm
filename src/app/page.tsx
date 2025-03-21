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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-6">
              <Image
                src="/logo.png"
                alt="Logo DoQCM"
                width={40}
                height={40}
                className="bg-white rounded-full"
              />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Plateforme professionnelle de <span className="text-blue-600 dark:text-blue-400">gestion de QCM</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Solution innovante de génération et de gestion de questionnaires à choix multiples, optimisée pour les professionnels de l&apos;éducation et de la formation.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => router.push("/register")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push("/login")}
              className="px-8 py-6 text-lg rounded-lg"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Fonctionnalités principales
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 dark:bg-blue-900/50 p-6 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">1. Import de documents</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Importez vos documents dans divers formats. Notre système analyse automatiquement le contenu pour générer des questions pertinentes.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/50 p-6 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">2. Génération automatique</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Notre intelligence artificielle analyse le contenu et génère des questions à choix multiples adaptées à votre contexte.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/50 p-6 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">3. Gestion avancée</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gérez vos QCM, suivez les résultats et partagez vos documents de manière sécurisée avec vos collaborateurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Pourquoi choisir DoQCM ?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Gain de temps considérable</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Optimisez votre productivité en générant des QCM en quelques secondes, évitant ainsi des heures de rédaction manuelle.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Questions pertinentes</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Notre intelligence artificielle analyse les concepts clés pour générer des questions ciblées et pertinentes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Suivi des performances</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analysez les résultats détaillés pour identifier les points d&apos;amélioration et optimiser votre formation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Évaluation personnalisée</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Chaque participant reçoit un ensemble unique de questions, garantissant une évaluation objective et individualisée.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Interface intuitive</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Une expérience utilisateur optimisée et responsive, accessible sur tous les appareils.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Optimisez votre processus d&apos;évaluation
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Rejoignez notre communauté de professionnels qui transforment leur approche pédagogique avec DoQCM.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => router.push("/register")}
            className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-800 dark:hover:bg-gray-200 px-8 py-6 text-lg rounded-lg"
          >
            Créer un compte professionnel
          </Button>
        </div>
      </section>
    </div>
  );
}
