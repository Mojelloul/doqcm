// Script pour réinitialiser automatiquement les compteurs quotidiens
// Ce script peut être exécuté manuellement ou via un cron job

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDailyUsage() {
  try {
    console.log('🔄 Début du reset quotidien...');
    
    // Appeler la fonction SQL pour réinitialiser
    const { data, error } = await supabase.rpc('reset_all_daily_usage');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Reset quotidien effectué avec succès');
    console.log('📊 Résultat:', data);
    
    // Vérifier l'état après reset
    await checkStatus();
    
  } catch (error) {
    console.error('❌ Erreur lors du reset:', error.message);
    process.exit(1);
  }
}

async function checkStatus() {
  try {
    console.log('\n📋 Vérification de l\'état actuel...');
    
    const { data, error } = await supabase.rpc('check_daily_usage_status');
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('👥 Utilisateurs avec activité aujourd\'hui:');
      data.forEach(user => {
        console.log(`  - ${user.user_email}: ${user.documents_today}/${user.daily_limit} (${user.status})`);
      });
    } else {
      console.log('✅ Aucun utilisateur avec activité aujourd\'hui');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

async function resetSpecificUser(userEmail) {
  try {
    console.log(`🔄 Reset pour l'utilisateur: ${userEmail}`);
    
    // Trouver l'ID de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !user) {
      throw new Error(`Utilisateur non trouvé: ${userEmail}`);
    }
    
    // Supprimer les logs d'aujourd'hui pour cet utilisateur
    const { error: deleteError } = await supabase
      .from('daily_usage_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`✅ Reset effectué pour ${userEmail}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du reset utilisateur:', error.message);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Reset pour tous les utilisateurs
    await resetDailyUsage();
  } else if (args[0] === '--user' && args[1]) {
    // Reset pour un utilisateur spécifique
    await resetSpecificUser(args[1]);
  } else if (args[0] === '--check') {
    // Vérifier seulement l'état
    await checkStatus();
  } else {
    console.log('📖 Utilisation:');
    console.log('  node daily-reset.js                    # Reset pour tous les utilisateurs');
    console.log('  node daily-reset.js --user email@test.com  # Reset pour un utilisateur spécifique');
    console.log('  node daily-reset.js --check            # Vérifier l\'état actuel');
  }
}

// Exécuter le script
main().then(() => {
  console.log('\n✨ Script terminé');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Erreur fatale:', error.message);
  process.exit(1);
}); 