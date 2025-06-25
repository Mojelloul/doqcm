# 🧪 Guide de Test du Système d'Abonnements

## 🎯 Problème Identifié
Le système ne vérifiait pas les limites d'abonnement lors de la création de QCM, permettant aux utilisateurs de créer plusieurs documents même avec l'offre gratuite.

## ✅ Solution Implémentée
1. **Vérification des abonnements** dans `TextAnalysisForm` avant la génération de QCM
2. **Validation des limites** : seulement le nombre de documents par jour
3. **Messages d'erreur explicites** quand les limites sont dépassées
4. **Limites par document** : caractères et destinataires gérés lors de la création

## 🚀 Comment Tester

### Étape 1 : Initialiser le Système
```bash
# Exécuter le script d'initialisation
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f initialize_subscriptions.sql
```

### Étape 2 : Vérifier l'Installation
```bash
# Exécuter le script de test
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f test_subscription_limits.sql
```

### Étape 3 : Test Manuel dans l'Application

#### Test 1 : Plan Gratuit (1 document/jour)
1. **Connectez-vous** avec un compte utilisateur
2. **Allez sur le Dashboard** - vérifiez que le panneau d'abonnement affiche "Plan gratuit"
3. **Créez un premier QCM** :
   - Titre : "Test QCM 1"
   - Contenu : texte de 1000 caractères
   - Ajoutez 5 destinataires
   - ✅ **Résultat attendu** : QCM créé avec succès

4. **Essayez de créer un deuxième QCM** :
   - Titre : "Test QCM 2"
   - Contenu : texte de 1000 caractères
   - Ajoutez 5 destinataires
   - ❌ **Résultat attendu** : Erreur "Limite quotidienne atteinte (1 documents/jour)"

#### Test 2 : Limite de Caractères par Document
1. **Réinitialisez l'utilisation** (voir script SQL ci-dessous)
2. **Créez un QCM avec 6000 caractères** :
   - ❌ **Résultat attendu** : Erreur lors de la création du document (géré par DocumentService)

#### Test 3 : Limite de Destinataires par Document
1. **Réinitialisez l'utilisation**
2. **Créez un QCM avec 25 destinataires** :
   - ❌ **Résultat attendu** : Erreur lors du partage du document (géré par DocumentService)

#### Test 4 : Plan Premium
1. **Changez l'abonnement vers premium** :
```sql
UPDATE user_subscriptions 
SET offer_id = (SELECT id FROM offers WHERE name = 'premium')
WHERE user_id = 'VOTRE_USER_ID';
```

2. **Testez les nouvelles limites** :
   - ✅ 10 documents par jour (au lieu de 1)
   - ✅ 10000 caractères par document (au lieu de 5000)
   - ✅ 50 destinataires par document (au lieu de 20)

## 🔧 Scripts de Test Utiles

### Réinitialiser l'utilisation d'un utilisateur
```sql
-- Remplacez 'USER_ID_HERE' par l'ID de l'utilisateur
DELETE FROM daily_usage_logs 
WHERE user_id = 'USER_ID_HERE' AND date = CURRENT_DATE;
```

### Simuler l'utilisation
```sql
-- Simuler qu'un utilisateur a déjà créé 1 document
INSERT INTO daily_usage_logs (user_id, date, documents_created, characters_used, recipients_added)
VALUES ('USER_ID_HERE', CURRENT_DATE, 1, 0, 0)
ON CONFLICT (user_id, date) 
DO UPDATE SET 
    documents_created = daily_usage_logs.documents_created + 1;
```

### Vérifier l'état actuel
```sql
-- Voir l'utilisation d'aujourd'hui pour tous les utilisateurs
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    o.name as offer_name,
    o.daily_document_limit,
    o.max_characters as limite_caracteres_par_document,
    o.max_recipients as limite_destinataires_par_document
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN offers o ON us.offer_id = o.id
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
ORDER BY u.email;
```

## 🐛 Dépannage

### Problème : L'utilisateur peut encore créer plusieurs documents
**Solution** : Vérifiez que le script d'initialisation a été exécuté et que l'utilisateur a un abonnement actif.

### Problème : Erreur "Aucun abonnement actif trouvé"
**Solution** : Créez un abonnement gratuit pour l'utilisateur :
```sql
INSERT INTO user_subscriptions (user_id, offer_id, status, start_date)
SELECT 
    'USER_ID_HERE',
    o.id,
    'active',
    NOW()
FROM offers o
WHERE o.name = 'free';
```

### Problème : Les compteurs ne se réinitialisent pas
**Solution** : Les compteurs se réinitialisent automatiquement chaque jour. Pour tester, utilisez le script de réinitialisation.

## 📊 Monitoring

Le système trace automatiquement :
- ✅ Nombre de documents créés par jour
- ✅ Limites de l'abonnement actuel
- ✅ Limites par document (caractères et destinataires)

## 🎉 Résultat Attendu

Avec ces modifications, un utilisateur avec l'offre gratuite :
- ✅ Peut créer **1 seul QCM par jour**
- ✅ Peut utiliser **maximum 5000 caractères par document**
- ✅ Peut ajouter **maximum 20 destinataires par document**
- ❌ **Ne peut plus** contourner les limites en créant plusieurs QCM
- ❌ **Reçoit des messages d'erreur clairs** quand les limites sont dépassées
- ✅ **Interface simplifiée** : affiche seulement les documents créés aujourd'hui 