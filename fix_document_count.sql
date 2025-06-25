-- Script pour corriger le comptage des documents qui a été doublé

-- 1. Voir l'état actuel avant correction
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE dul.documents_created > 0
ORDER BY dul.documents_created DESC;

-- 2. Corriger le comptage (diviser par 2 car il a été incrémenté deux fois)
UPDATE daily_usage_logs 
SET documents_created = GREATEST(1, documents_created / 2)
WHERE date = CURRENT_DATE AND documents_created > 1;

-- 3. Vérifier le résultat après correction
SELECT 
    u.email,
    COALESCE(dul.documents_created, 0) as documents_today,
    dul.date,
    dul.created_at
FROM users u
LEFT JOIN daily_usage_logs dul ON u.id = dul.user_id AND dul.date = CURRENT_DATE
WHERE dul.documents_created > 0
ORDER BY dul.documents_created DESC;

-- 4. Vérifier que les utilisateurs peuvent maintenant créer des documents
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
WHERE dul.documents_created > 0
ORDER BY u.email; 