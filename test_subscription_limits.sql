-- Script de test des limites d'abonnement
-- Ce script simule la création de documents pour tester les limites

-- 1. Vérifier l'état actuel des abonnements
SELECT 
    u.email,
    us.status as subscription_status,
    o.name as offer_name,
    o.daily_document_limit,
    o.max_characters,
    o.max_recipients
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN offers o ON us.offer_id = o.id
ORDER BY u.email;

-- 2. Vérifier l'utilisation d'aujourd'hui (seulement les documents)
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    o.daily_document_limit,
    CASE 
        WHEN COALESCE(dul.documents_created, 0) >= o.daily_document_limit THEN 'LIMITE ATTEINTE'
        ELSE 'PEUT CRÉER'
    END as status_documents,
    o.max_characters as limite_caracteres_par_document,
    o.max_recipients as limite_destinataires_par_document
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN offers o ON us.offer_id = o.id
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
ORDER BY u.email;

-- 3. Simuler l'incrémentation d'utilisation (pour tester)
-- Remplacez 'USER_ID_HERE' par un vrai ID d'utilisateur
/*
INSERT INTO daily_usage_logs (user_id, date, documents_created, characters_used, recipients_added)
VALUES ('USER_ID_HERE', CURRENT_DATE, 1, 0, 0)
ON CONFLICT (user_id, date) 
DO UPDATE SET 
    documents_created = daily_usage_logs.documents_created + 1;
*/

-- 4. Réinitialiser l'utilisation d'un utilisateur (pour tester)
-- Remplacez 'USER_ID_HERE' par un vrai ID d'utilisateur
/*
DELETE FROM daily_usage_logs 
WHERE user_id = 'USER_ID_HERE' AND date = CURRENT_DATE;
*/

-- 5. Vérifier les documents créés aujourd'hui
SELECT 
    d.title,
    d.owner_id,
    u.email as owner_email,
    d.created_at,
    LENGTH(d.content) as content_length
FROM documents d
JOIN users u ON d.owner_id = u.id
WHERE DATE(d.created_at) = CURRENT_DATE
ORDER BY d.created_at DESC; 