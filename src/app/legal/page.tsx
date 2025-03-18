export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
        <p className="mb-3">
          <strong>DoQCM</strong> est édité par : jelloul mohamed
        </p>
        {/* <address className="not-italic mb-3">
          <strong>[Nom de votre société/entité]</strong><br />
          Adresse : [Votre adresse complète]<br />
          Téléphone : [Votre numéro de téléphone]<br />
          Email : contact@doqcm.com
        </address>
        <p className="mb-3">
          SIRET : [Votre numéro SIRET]<br />
          Numéro de TVA intracommunautaire : [Votre numéro de TVA]
        </p>
        <p>
          Représentant légal : [Nom du représentant légal]
        </p> */}
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Hébergement</h2>
        <p className="mb-3">
          Le site DoQCM est hébergé par :
        </p>
        <address className="not-italic">
          <strong>[SUPABASE]</strong><br />
          {/* Adresse : [Adresse de l'hébergeur]<br />
          Téléphone : [Téléphone de l'hébergeur]<br />
          Site web : [Site web de l'hébergeur] */}
        </address>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
        <p className="mb-3">
          L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est la propriété exclusive de DoQCM
          ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction totale ou partielle est strictement interdite sans autorisation écrite préalable.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Protection des données personnelles</h2>
        <p className="mb-3">
          Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général
          sur la Protection des Données (RGPD), vous disposez de droits concernant vos données personnelles.
        </p>
        <p className="mb-3">
          Pour connaître les détails du traitement de vos données personnelles, veuillez consulter notre
          <a href="/privacy" className="text-primary underline ml-1">politique de confidentialité</a>.
        </p>
        <p>
          Le Délégué à la Protection des Données (DPO) peut être contacté à l'adresse : dpo@doqcm.com
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Liens hypertextes</h2>
        <p className="mb-3">
          Le site DoQCM peut contenir des liens hypertextes vers d'autres sites. 
          Nous n'avons pas la possibilité de vérifier le contenu de ces sites, et
          nous n'assumons aucune responsabilité quant à leur contenu.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Limitation de responsabilité</h2>
        <p className="mb-3">
          DoQCM s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations diffusées, 
          mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
        </p>
        <p>
          En conséquence, nous déclinons toute responsabilité pour toute imprécision, inexactitude ou omission.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Droit applicable et juridiction compétente</h2>
        <p className="mb-3">
          Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français
          seront seuls compétents.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
        <p>
          Pour toute question concernant ces mentions légales, veuillez nous contacter à l'adresse : legal@doqcm.com
        </p>
      </section>
      
      <p className="text-sm text-muted-foreground mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString()}
      </p>
    </div>
  );
} 