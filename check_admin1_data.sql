-- Vérification rapide des données admin1@email.com
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Trouver l'utilisateur admin1@email.com
SELECT 'auth.users' as table_name, id, email, created_at 
FROM auth.users 
WHERE email = 'admin1@email.com'

UNION ALL

SELECT 'users' as table_name, id, email, created_at 
FROM users 
WHERE email = 'admin1@email.com';

-- 2. Voir toutes les réponses existantes
SELECT 
    ua.user_id,
    u.email,
    ua.document_id,
    d.title as document_title,
    COUNT(*) as nombre_reponses
FROM user_answers ua
LEFT JOIN users u ON ua.user_id = u.id
LEFT JOIN documents d ON ua.document_id = d.id
GROUP BY ua.user_id, u.email, ua.document_id, d.title
ORDER BY nombre_reponses DESC;

-- 3. Voir les documents disponibles
SELECT id, title, created_at 
FROM documents 
ORDER BY created_at DESC; 