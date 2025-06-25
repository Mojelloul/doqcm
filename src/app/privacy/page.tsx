"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Politique de confidentialité</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Découvrez comment nous protégeons et utilisons vos données personnelles
          </p>
        </div>

        <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
            <CardTitle className="text-xl sm:text-2xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Politique de confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">1. Collecte d&apos;informations</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Nous collectons les informations que vous nous fournissez directement lors de l&apos;utilisation de notre service, notamment :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                <li>Informations de compte (nom, email)</li>
                <li>Documents que vous importez sur la plateforme</li>
                <li>Données d&apos;utilisation du service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">2. Utilisation des informations</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                <li>Fournir et améliorer nos services</li>
                <li>Générer des QCM à partir de vos documents</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Assurer la sécurité de notre plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">3. Protection des données</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">4. Partage des données</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations uniquement dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour respecter nos obligations légales</li>
                <li>Pour protéger nos droits et notre sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">5. Vos droits</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Vous avez le droit de :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                <li>Accéder à vos informations personnelles</li>
                <li>Corriger vos informations inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Exporter vos données</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">6. Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez contrôler l&apos;utilisation des cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">7. Modifications de la politique</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entrent en vigueur dès leur publication sur notre site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                8. Contact
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, veuillez nous contacter à :
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Email : contact.doqcm@gmail.com
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 