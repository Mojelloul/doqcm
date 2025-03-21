"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mentions légales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
            <p className="text-gray-600">
              Le site DoQCM est édité par :
            </p>
            <div className="mt-2 text-gray-600">
              <p>Mohamed Jelloul</p>
              <p>Email : jelloulmohamed11@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Hébergement</h2>
            <p className="text-gray-600">
              Le site est hébergé par Vercel Inc.
            </p>
            <div className="mt-2 text-gray-600">
              <p>340 S Lemon Ave #4133</p>
              <p>Walnut, CA 91789</p>
              <p>États-Unis</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de DoQCM ou de ses partenaires. Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite sans l&apos;autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Protection des données personnelles</h2>
            <p className="text-gray-600">
              Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des données vous concernant. Pour exercer ces droits, vous pouvez nous contacter par email à jelloulmohamed11@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Liens hypertextes</h2>
            <p className="text-gray-600">
              Le site DoQCM peut contenir des liens hypertextes vers d&apos;autres sites. Nous ne pouvons pas être tenus responsables du contenu des sites vers lesquels des liens sont établis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Limitation de responsabilité</h2>
            <p className="text-gray-600">
              Les informations contenues sur ce site sont fournies à titre indicatif. Nous nous efforçons d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées, mais nous ne pouvons garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations diffusées sur notre site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Loi applicable</h2>
            <p className="text-gray-600">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant ces mentions légales, veuillez nous contacter à :
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