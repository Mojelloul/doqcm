export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="mb-3">
          La présente politique de confidentialité vous informe sur la façon dont nous recueillons, 
          utilisons et protégeons vos données personnelles lorsque vous utilisez notre application DOQCM.
        </p>
        <p>
          Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) 
          et s'applique à tous les utilisateurs de notre application.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
        <p className="mb-3">Nous collectons les données suivantes :</p>
        <ul className="list-disc pl-6 mb-3">
          <li>Informations d'identification (email, nom)</li>
          <li>Contenu des documents que vous créez</li>
          <li>Emails des destinataires avec qui vous partagez des documents</li>
          <li>Données de connexion (adresse IP, date et heure)</li>
        </ul>
        <p>
          Ces données sont nécessaires au fonctionnement de l'application et à la fourniture des services demandés.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Base légale du traitement</h2>
        <p className="mb-3">Nous traitons vos données personnelles sur les bases légales suivantes :</p>
        <ul className="list-disc pl-6">
          <li><strong>Exécution du contrat</strong> : Traitement nécessaire à l'exécution du service d'analyse de texte et de génération de QCM</li>
          <li><strong>Consentement</strong> : Pour le traitement des données par notre service d'IA et le partage de documents</li>
          <li><strong>Intérêt légitime</strong> : Pour l'amélioration de nos services et la sécurité de l'application</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Utilisation des données</h2>
        <p className="mb-3">Vos données sont utilisées pour :</p>
        <ul className="list-disc pl-6">
          <li>Fournir et améliorer nos services d'analyse de texte et de génération de QCM</li>
          <li>Permettre le partage de documents avec d'autres utilisateurs</li>
          <li>Assurer la sécurité de votre compte et de l'application</li>
          <li>Vous contacter en cas de besoin concernant votre compte</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Traitement via intelligence artificielle</h2>
        <p className="mb-3">
          Notre application utilise le service d'IA Gemini pour l'analyse de texte et la génération de QCM.
          Les textes que vous soumettez sont envoyés à ce service pour traitement.
        </p>
        <p>
          Aucune donnée personnelle n'est conservée par ce service tiers au-delà du temps nécessaire 
          au traitement de votre demande.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Partage des données</h2>
        <p className="mb-3">Nous partageons vos données uniquement avec :</p>
        <ul className="list-disc pl-6">
          <li>Les autres utilisateurs avec qui vous choisissez explicitement de partager vos documents</li>
          <li>Les services tiers nécessaires au fonctionnement de l'application (Supabase pour le stockage, Gemini pour l'IA)</li>
        </ul>
        <p>
          Nous ne vendons jamais vos données personnelles à des tiers.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Durée de conservation</h2>
        <p>
          Vos données sont conservées tant que votre compte est actif. Si vous supprimez votre compte,
          toutes vos données personnelles seront supprimées dans un délai de 30 jours, à l'exception
          des données que nous sommes légalement tenus de conserver.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Vos droits</h2>
        <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul className="list-disc pl-6">
          <li>Droit d'accès à vos données personnelles</li>
          <li>Droit de rectification des données inexactes</li>
          <li>Droit à l'effacement (droit à l'oubli)</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité des données</li>
          <li>Droit d'opposition au traitement</li>
        </ul>
        <p className="mt-3">
          Pour exercer ces droits, veuillez nous contacter via la section "Gestion de votre compte" 
          ou par email à privacy@doqcm.com.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Cookies</h2>
        <p>
          Notre application utilise des cookies pour améliorer votre expérience utilisateur.
          Vous pouvez gérer vos préférences concernant les cookies via la bannière de consentement
          qui s'affiche lors de votre première visite.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Modifications de la politique</h2>
        <p>
          Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
          Les modifications entrent en vigueur dès leur publication sur cette page.
          Nous vous informerons de tout changement important par email.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
        <p>
          Pour toute question concernant cette politique de confidentialité,
          veuillez nous contacter à privacy@doqcm.com.
        </p>
      </section>
    </div>
  );
} 