# 🚀 Guide de Configuration - Reset Quotidien Automatique

## 📋 Étapes de Configuration

### 1. Variables d'Environnement
Assure-toi que ton fichier `.env` principal contient :
```
NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase
SUPABASE_SERVICE_ROLE_KEY=ton_service_role_key
```

### 2. Exécuter les Fonctions SQL
Va dans ton **Dashboard Supabase** → **SQL Editor** et exécute :

```sql
-- Fonction pour réinitialiser tous les compteurs quotidiens
CREATE OR REPLACE FUNCTION reset_all_daily_usage()
RETURNS text AS $$
DECLARE
    deleted_count integer;
BEGIN
    -- Supprimer tous les logs d'aujourd'hui
    DELETE FROM daily_usage_logs 
    WHERE date = CURRENT_DATE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Retourner un message de confirmation
    RETURN format('Reset quotidien effectué: %s utilisateurs réinitialisés', deleted_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'état actuel
CREATE OR REPLACE FUNCTION check_daily_usage_status()
RETURNS TABLE(
    user_email text,
    documents_today bigint,
    daily_limit bigint,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email::text,
        COALESCE(dul.documents_created, 0)::bigint,
        o.daily_document_limit::bigint,
        CASE 
            WHEN COALESCE(dul.documents_created, 0) >= o.daily_document_limit THEN 'LIMITE ATTEINTE'
            ELSE 'PEUT CRÉER'
        END::text
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
    LEFT JOIN offers o ON us.offer_id = o.id
    LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
    ORDER BY dul.documents_created DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
```

### 3. Tester le Script

#### Test manuel :
```bash
# Reset pour tous les utilisateurs
node scripts/daily-reset.js

# Reset pour un utilisateur spécifique
node scripts/daily-reset.js --user email@test.com

# Vérifier l'état actuel
node scripts/daily-reset.js --check
```

### 4. Automatisation (Optionnel)

#### Option A : Windows Task Scheduler
1. Ouvre "Planificateur de tâches"
2. Crée une nouvelle tâche
3. Programme-la pour s'exécuter tous les jours à 00:01
4. Commande : `node C:\chemin\vers\ton\projet\scripts\daily-reset.js`

#### Option B : Cron Job (si tu utilises Linux/WSL)
```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter tous les jours à 00:01
1 0 * * * cd /chemin/vers/ton/projet && node scripts/daily-reset.js
```

## 🧪 Tests

### Test 1 : Vérifier l'état actuel
```bash
node scripts/daily-reset.js --check
```

### Test 2 : Reset manuel
```bash
node scripts/daily-reset.js
```

### Test 3 : Reset utilisateur spécifique
```bash
node scripts/daily-reset.js --user ton@email.com
```

## 🔧 Dépannage

### Erreur "Variables d'environnement manquantes"
- Vérifie que ton fichier `.env` contient les bonnes variables
- Assure-toi que le script s'exécute depuis le bon répertoire

### Erreur "Fonction non trouvée"
- Vérifie que tu as bien exécuté les fonctions SQL dans Supabase
- Vérifie les permissions de la fonction

### Erreur de connexion Supabase
- Vérifie que ton URL et clé de service sont corrects
- Vérifie que ton projet Supabase est actif 