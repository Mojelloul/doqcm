"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Politique de confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Collecte d&apos;informations</h2>
            <p className="text-gray-600">
              Nous collectons les informations que vous nous fournissez directement lors de l&apos;utilisation de notre service, notamment :
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Informations de compte (nom, email)</li>
              <li>Documents que vous importez sur la plateforme</li>
              <li>Données d&apos;utilisation du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Utilisation des informations</h2>
            <p className="text-gray-600">
              Nous utilisons vos informations pour :
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Fournir et améliorer nos services</li>
              <li>Générer des QCM à partir de vos documents</li>
              <li>Communiquer avec vous concernant votre compte</li>
              <li>Assurer la sécurité de notre plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Protection des données</h2>
            <p className="text-gray-600">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Partage des données</h2>
            <p className="text-gray-600">
              Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations uniquement dans les cas suivants :
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Avec votre consentement explicite</li>
              <li>Pour respecter nos obligations légales</li>
              <li>Pour protéger nos droits et notre sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Vos droits</h2>
            <p className="text-gray-600">
              Vous avez le droit de :
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Accéder à vos informations personnelles</li>
              <li>Corriger vos informations inexactes</li>
              <li>Demander la suppression de vos données</li>
              <li>Vous opposer au traitement de vos données</li>
              <li>Exporter vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-gray-600">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez contrôler l&apos;utilisation des cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Modifications de la politique</h2>
            <p className="text-gray-600">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entrent en vigueur dès leur publication sur notre site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, veuillez nous contacter à :
            </p>
            <p className="text-gray-600 mt-2">
              Email : jelloulmohamed11@gmail.com
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
} 