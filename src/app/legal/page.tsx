"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, Mail, Building, Shield, Link, AlertTriangle, Gavel } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LegalPage() {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Mentions légales</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Informations légales et conditions d'utilisation de DoQCM
          </p>
        </div>

        <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
            <CardTitle className="text-xl sm:text-2xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Scale className="h-6 w-6" />
              Mentions légales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Building className="h-5 w-5" />
                1. Éditeur du site
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Le site DoQCM est édité par :
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400">Email : contact.doqcm@gmail.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Building className="h-5 w-5" />
                2. Hébergement
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Le site est hébergé par Vercel Inc.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300">340 S Lemon Ave #4133</p>
                <p className="text-gray-700 dark:text-gray-300">Walnut, CA 91789</p>
                <p className="text-gray-700 dark:text-gray-300">États-Unis</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                3. Propriété intellectuelle
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de DoQCM ou de ses partenaires. Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite sans l&apos;autorisation écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                4. Protection des données personnelles
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des données vous concernant. Pour exercer ces droits, vous pouvez nous contacter par email à contact.doqcm@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Link className="h-5 w-5" />
                5. Liens hypertextes
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Le site DoQCM peut contenir des liens hypertextes vers d&apos;autres sites. Nous ne pouvons pas être tenus responsables du contenu des sites vers lesquels des liens sont établis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                6. Limitation de responsabilité
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Les informations contenues sur ce site sont fournies à titre indicatif. Nous nous efforçons d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées, mais nous ne pouvons garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations diffusées sur notre site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                7. Loi applicable
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                8. Contact
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Pour toute question concernant ces mentions légales, veuillez nous contacter à :
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