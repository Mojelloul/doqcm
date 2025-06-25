-- Script pour réinitialiser tous les compteurs d'aujourd'hui

-- ATTENTION : Ce script va supprimer tous les logs d'utilisation d'aujourd'hui
-- Assurez-vous que c'est bien ce que vous voulez faire

-- 1. Voir l'état actuel avant réinitialisation
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE dul.documents_created > 0
ORDER BY dul.documents_created DESC;

-- 2. Supprimer tous les logs d'utilisation d'aujourd'hui
DELETE FROM daily_usage_logs 
WHERE date = CURRENT_DATE;

-- 3. Vérifier que la réinitialisation a fonctionné
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE dul.documents_created > 0
ORDER BY dul.documents_created DESC;

-- 4. Vérifier que tous les utilisateurs peuvent maintenant créer des documents
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
ORDER BY u.email; 