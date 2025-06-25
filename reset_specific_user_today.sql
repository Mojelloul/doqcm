-- Script pour réinitialiser un utilisateur spécifique pour aujourd'hui

-- Remplacez 'USER_ID_HERE' par l'ID de l'utilisateur
-- Exemple : '123e4567-e89b-12d3-a456-426614174000'

-- 1. Voir l'état actuel de l'utilisateur
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE u.id = 'USER_ID_HERE';

-- 2. Supprimer les logs d'aujourd'hui pour cet utilisateur
DELETE FROM daily_usage_logs 
WHERE user_id = 'USER_ID_HERE' AND date = CURRENT_DATE;

-- 3. Vérifier que l'utilisateur peut maintenant créer des documents
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    o.daily_document_limit,
    CASE 
        WHEN COALESCE(dul.documents_created, 0) >= o.daily_document_limit THEN 'LIMITE ATTEINTE'
        ELSE 'PEUT CRÉER'
    END as status
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN offers o ON us.offer_id = o.id
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE u.id = 'USER_ID_HERE'; 