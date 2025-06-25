-- Script pour vérifier le système de reset quotidien des compteurs

-- 1. Vérifier tous les logs d'utilisation (pas seulement aujourd'hui)
SELECT 
    u.email,
    dul.date,
    dul.documents_created,
    dul.created_at,
    CASE 
        WHEN dul.date = CURRENT_DATE THEN 'AUJOURD\'HUI'
        WHEN dul.date = CURRENT_DATE - INTERVAL '1 day' THEN 'HIER'
        WHEN dul.date = CURRENT_DATE - INTERVAL '2 days' THEN 'AVANT-HIER'
        ELSE 'PLUS ANCIEN'
    END as periode
FROM users u
JOIN daily_usage_logs dul ON u.id = dul.user_id
WHERE dul.documents_created > 0
ORDER BY dul.date DESC, u.email;

-- 2. Vérifier spécifiquement l'utilisation d'aujourd'hui
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE dul.documents_created > 0
ORDER BY dul.documents_created DESC;

-- 3. Vérifier l'utilisation d'hier
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_hier,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE - INTERVAL '1 day'
WHERE dul.documents_created > 0
ORDER BY dul.documents_created DESC;

-- 4. Vérifier si un utilisateur spécifique a des logs pour aujourd'hui
-- Remplacez 'USER_ID_HERE' par l'ID de l'utilisateur
/*
SELECT 
    u.email,
    dul.date,
    dul.documents_created,
    dul.created_at
FROM users u
JOIN daily_usage_logs dul ON u.id = dul.user_id
WHERE u.id = 'USER_ID_HERE'
ORDER BY dul.date DESC;
*/ 