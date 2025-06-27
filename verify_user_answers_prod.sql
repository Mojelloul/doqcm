-- Script de vérification pour user_answers en production
-- Exécutez ce script pour vérifier que tout fonctionne

-- 1. Vérifier que la table existe
SELECT 
    'Table user_answers exists' as check_result,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'user_answers';

-- 2. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_answers' 
ORDER BY ordinal_position;

-- 3. Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_answers';

-- 4. Vérifier les politiques RLS
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_answers';

-- 5. Vérifier les triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_answers';

-- 6. Test d'insertion (à exécuter avec un utilisateur connecté)
-- INSERT INTO user_answers (user_id, document_id, question_id, choice_id, is_correct, time_spent)
-- VALUES (
--     'USER_ID_HERE', 
--     'DOCUMENT_ID_HERE', 
--     'QUESTION_ID_HERE', 
--     'CHOICE_ID_HERE', 
--     true, 
--     30
-- );

-- 7. Compter les réponses existantes (si il y en a)
SELECT 
    COUNT(*) as total_answers,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT document_id) as unique_documents,
    COUNT(CASE WHEN is_correct THEN 1 END) as correct_answers,
    ROUND(COUNT(CASE WHEN is_correct THEN 1 END) * 100.0 / COUNT(*), 1) as success_rate
FROM user_answers; 