// Script pour vérifier et configurer les variables d'environnement
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des variables d\'environnement...\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ Fichier .env non trouvé');
  console.log('📝 Création du fichier .env...\n');
  
  const envContent = `# Variables d'environnement pour DOQCM
# Remplace ces valeurs par tes vraies valeurs Supabase

NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=ton_service_role_key_ici

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=ton_google_ai_key_ici
`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env créé avec succès');
    console.log('📋 Tu dois maintenant éditer ce fichier avec tes vraies valeurs');
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier .env:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Fichier .env trouvé');
}

// Charger les variables d'environnement
require('dotenv').config();

// Vérifier les variables requises
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('\n📋 Variables d\'environnement :');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== `ton_${varName.toLowerCase()}_ici`) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: MANQUANTE ou NON CONFIGURÉE`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n⚠️  ATTENTION: Certaines variables sont manquantes');
  console.log('📝 Tu dois éditer le fichier .env avec tes vraies valeurs Supabase');
  console.log('\n🔗 Pour obtenir tes clés Supabase :');
  console.log('1. Va sur https://supabase.com/dashboard');
  console.log('2. Sélectionne ton projet');
  console.log('3. Va dans Settings → API');
  console.log('4. Copie Project URL et service_role key');
} else {
  console.log('\n✅ Toutes les variables sont configurées !');
  console.log('🚀 Tu peux maintenant utiliser le script de reset quotidien');
}

console.log('\n📖 Prochaines étapes :');
console.log('1. Configure tes variables dans le fichier .env');
console.log('2. Exécute les fonctions SQL dans Supabase Dashboard');
console.log('3. Teste le script : node scripts/daily-reset.js --check'); 