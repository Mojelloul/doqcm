-- Vérification des IDs spécifiques utilisés par le modal
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si cet user_id existe
SELECT 'auth.users' as table_name, id, email, created_at 
FROM auth.users 
WHERE id = '26d35150-1090-4c45-bf31-e7fb02df731f'

UNION ALL

SELECT 'users' as table_name, id, email, created_at 
FROM users 
WHERE id = '26d35150-1090-4c45-bf31-e7fb02df731f';

-- 2. Vérifier si ce document_id existe
SELECT id, title, created_at 
FROM documents 
WHERE id = '1f66ffec-c3f5-4510-8195-5f692cf8e768';

-- 3. Vérifier s'il y a des réponses pour cette combinaison
SELECT 
    ua.id,
    ua.user_id,
    ua.document_id,
    ua.question_id,
    ua.choice_id,
    ua.is_correct,
    ua.answered_at,
    ua.time_spent
FROM user_answers ua
WHERE ua.user_id = '26d35150-1090-4c45-bf31-e7fb02df731f'
  AND ua.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768';

-- 4. Voir toutes les réponses pour cet user_id (tous documents)
SELECT 
    ua.document_id,
    d.title as document_title,
    COUNT(*) as nombre_reponses
FROM user_answers ua
LEFT JOIN documents d ON ua.document_id = d.id
WHERE ua.user_id = '26d35150-1090-4c45-bf31-e7fb02df731f'
GROUP BY ua.document_id, d.title;

-- 5. Voir toutes les réponses pour ce document_id (tous utilisateurs)
SELECT 
    ua.user_id,
    u.email,
    COUNT(*) as nombre_reponses
FROM user_answers ua
LEFT JOIN users u ON ua.user_id = u.id
WHERE ua.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
GROUP BY ua.user_id, u.email; 