-- Script de test du système d'abonnements

-- 1. Vérifier les tables créées
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('offers', 'user_subscriptions', 'daily_usage_logs')
ORDER BY table_name, ordinal_position;

-- 2. Vérifier les offres disponibles
SELECT 
    id,
    name,
    daily_document_limit,
    max_characters,
    max_recipients,
    price,
    description
FROM offers 
ORDER BY price;

-- 3. Vérifier les abonnements actifs
SELECT 
    us.id,
    us.user_id,
    us.status,
    us.start_date,
    o.name as offer_name,
    o.daily_document_limit,
    o.max_characters,
    o.max_recipients
FROM user_subscriptions us
JOIN offers o ON us.offer_id = o.id
WHERE us.status = 'active'
ORDER BY us.created_at DESC;

-- 4. Vérifier l'utilisation quotidienne (aujourd'hui)
SELECT 
    dul.user_id,
    dul.date,
    dul.documents_created,
    dul.characters_used,
    dul.recipients_added,
    o.name as offer_name,
    o.daily_document_limit,
    o.max_characters,
    o.max_recipients
FROM daily_usage_logs dul
JOIN user_subscriptions us ON dul.user_id = us.user_id
JOIN offers o ON us.offer_id = o.id
WHERE dul.date = CURRENT_DATE
AND us.status = 'active'
ORDER BY dul.documents_created DESC;

-- 5. Test de simulation : Vérifier si un utilisateur peut créer un document
-- Remplacez 'USER_ID_HERE' par un vrai ID d'utilisateur
/*
WITH user_check AS (
    SELECT 
        u.id as user_id,
        us.status as subscription_status,
        o.name as offer_name,
        o.daily_document_limit,
        o.max_characters,
        o.max_recipients,
        COALESCE(dul.documents_created, 0) as documents_today,
        COALESCE(dul.characters_used, 0) as characters_used,
        COALESCE(dul.recipients_added, 0) as recipients_added
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
    LEFT JOIN offers o ON us.offer_id = o.id
    LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
    WHERE u.id = 'USER_ID_HERE'
)
SELECT 
    user_id,
    subscription_status,
    offer_name,
    CASE 
        WHEN subscription_status = 'active' THEN 'Oui'
        ELSE 'Non - Pas d\'abonnement actif'
    END as peut_creer_document,
    CASE 
        WHEN subscription_status = 'active' AND documents_today < daily_document_limit THEN 'Oui'
        WHEN subscription_status = 'active' AND documents_today >= daily_document_limit THEN 'Non - Limite quotidienne atteinte'
        ELSE 'Non - Pas d\'abonnement actif'
    END as peut_creer_aujourd_hui,
    documents_today,
    daily_document_limit,
    characters_used,
    max_characters,
    recipients_added,
    max_recipients
FROM user_check;
*/ 