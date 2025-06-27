-- Vérifier les données d'admin5@email.com
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Voir les données dans employees_documents
SELECT 
    u.id as user_id,
    u.email,
    ed.score as employee_score,
    ed.document_id
FROM users u
LEFT JOIN employees_documents ed ON u.id = ed.employee_id 
WHERE u.email = 'admin5@email.com' 
  AND ed.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768';

-- 2. Voir les réponses détaillées dans user_answers
SELECT 
    ua.id,
    ua.user_id,
    ua.document_id,
    ua.question_id,
    ua.choice_id,
    ua.is_correct,
    ua.time_spent,
    ua.answered_at,
    qq.question,
    qc.choice
FROM user_answers ua
JOIN users u ON ua.user_id = u.id
JOIN qcm_questions qq ON ua.question_id = qq.id
JOIN qcm_choices qc ON ua.choice_id = qc.id
WHERE u.email = 'admin5@email.com' 
  AND ua.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
ORDER BY ua.answered_at;

-- 3. Compter toutes les réponses d'admin5@email.com
SELECT 
    COUNT(*) as total_reponses,
    COUNT(CASE WHEN is_correct THEN 1 END) as reponses_correctes,
    ROUND(COUNT(CASE WHEN is_correct THEN 1 END) * 100.0 / COUNT(*), 1) as pourcentage
FROM user_answers ua
JOIN users u ON ua.user_id = u.id
WHERE u.email = 'admin5@email.com' 
  AND ua.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'; 