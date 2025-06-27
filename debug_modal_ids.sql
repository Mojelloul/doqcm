-- Debug: Vérifier les IDs utilisés par le modal
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Voir les données de admin5@email.com
SELECT 
    u.id as user_id,
    u.email,
    ed.score as employee_score,
    COUNT(ua.id) as nombre_reponses_detaillees
FROM users u
LEFT JOIN employees_documents ed ON u.id = ed.employee_id AND ed.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
LEFT JOIN user_answers ua ON u.id = ua.user_id AND ua.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
WHERE u.email = 'admin5@email.com'
GROUP BY u.id, u.email, ed.score;

-- 2. Voir les réponses détaillées de admin5@email.com
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

-- 3. Voir les réponses détaillées de admin1@email.com (pour comparaison)
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
WHERE u.email = 'admin1@email.com' 
  AND ua.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
ORDER BY ua.answered_at; 