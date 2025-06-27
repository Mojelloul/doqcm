-- Trouver où sont stockées les vraies données de progression
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Voir toutes les tables de la base de données
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Chercher dans les tables qui pourraient contenir les réponses
-- Table user_answers (que nous utilisons)
SELECT COUNT(*) as total_user_answers FROM user_answers;

-- 3. Chercher dans d'autres tables possibles
-- Table qcm_results (si elle existe)
SELECT COUNT(*) as total_qcm_results FROM qcm_results;

-- 4. Chercher dans la table users pour voir s'il y a des données de progression
SELECT 
    id, 
    email, 
    created_at,
    -- Chercher des colonnes qui pourraient contenir des données de progression
    (SELECT COUNT(*) FROM user_answers WHERE user_id = users.id) as nombre_reponses
FROM users 
WHERE email = 'admin1@email.com';

-- 5. Voir toutes les colonnes de la table users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 6. Chercher dans les tables de documents pour voir s'il y a des données liées
SELECT 
    d.id,
    d.title,
    (SELECT COUNT(*) FROM user_answers WHERE document_id = d.id) as nombre_reponses
FROM documents d
WHERE d.id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'; 