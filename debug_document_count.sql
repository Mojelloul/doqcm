-- Script de débogage pour le problème de comptage des documents

-- 1. Vérifier tous les utilisateurs et leurs abonnements
SELECT 
    u.id as user_id,
    u.email,
    us.status as subscription_status,
    o.name as offer_name,
    o.daily_document_limit
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN offers o ON us.offer_id = o.id
ORDER BY u.email;

-- 2. Vérifier l'utilisation d'aujourd'hui pour tous les utilisateurs
SELECT 
    u.id as user_id,
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at as log_created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
ORDER BY u.email;

-- 3. Vérifier tous les logs d'utilisation d'aujourd'hui
SELECT 
    dul.id,
    dul.user_id,
    u.email,
    dul.date,
    dul.documents_created,
    dul.characters_used,
    dul.recipients_added,
    dul.created_at
FROM daily_usage_logs dul
JOIN users u ON dul.user_id = u.id
WHERE dul.date = CURRENT_DATE
ORDER BY dul.created_at DESC;

-- 4. Vérifier les documents créés aujourd'hui
SELECT 
    d.id as document_id,
    d.title,
    d.owner_id,
    u.email as owner_email,
    d.created_at,
    DATE(d.created_at) as created_date
FROM documents d
JOIN users u ON d.owner_id = u.id
WHERE DATE(d.created_at) = CURRENT_DATE
ORDER BY d.created_at DESC;

-- 5. Vérifier s'il y a des doublons dans les logs
SELECT 
    user_id,
    date,
    COUNT(*) as log_count,
    SUM(documents_created) as total_documents
FROM daily_usage_logs
WHERE date = CURRENT_DATE
GROUP BY user_id, date
HAVING COUNT(*) > 1;

-- 6. Vérifier les logs pour un utilisateur spécifique (remplacez USER_ID_HERE)
/*
SELECT 
    dul.id,
    dul.user_id,
    u.email,
    dul.date,
    dul.documents_created,
    dul.created_at
FROM daily_usage_logs dul
JOIN users u ON dul.user_id = u.id
WHERE dul.user_id = 'USER_ID_HERE' AND dul.date = CURRENT_DATE
ORDER BY dul.created_at DESC;
*/ 