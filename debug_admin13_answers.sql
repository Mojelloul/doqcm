-- Script pour déboguer les réponses de admin13@email.com
-- Vérifier toutes les réponses de cet utilisateur

-- 1. Trouver l'ID de l'utilisateur admin13@email.com
SELECT id, email FROM users WHERE email = 'admin13@email.com';

-- 2. Vérifier toutes les réponses de cet utilisateur avec les détails
SELECT 
    ua.id,
    ua.document_id,
    ua.question_id,
    ua.choice_id,
    ua.is_correct,
    ua.answered_at,
    ua.time_spent,
    d.title as document_title,
    q.question,
    c.choice,
    c.is_correct as choice_is_correct
FROM user_answers ua
JOIN users u ON ua.user_id = u.id
JOIN documents d ON ua.document_id = d.id
JOIN qcm_questions q ON ua.question_id = q.id
JOIN qcm_choices c ON ua.choice_id = c.id
WHERE u.email = 'admin13@email.com'
ORDER BY ua.answered_at;

-- 3. Compter les réponses par document
SELECT 
    d.title as document_title,
    COUNT(*) as nombre_reponses,
    COUNT(CASE WHEN ua.is_correct THEN 1 END) as reponses_correctes,
    ROUND(COUNT(CASE WHEN ua.is_correct THEN 1 END) * 100.0 / COUNT(*), 1) as pourcentage
FROM user_answers ua
JOIN users u ON ua.user_id = u.id
JOIN documents d ON ua.document_id = d.id
WHERE u.email = 'admin13@email.com'
GROUP BY d.id, d.title
ORDER BY d.title;

-- 4. Vérifier s'il y a des doublons (même question répondue plusieurs fois)
SELECT 
    ua.question_id,
    COUNT(*) as nombre_reponses_meme_question,
    STRING_AGG(ua.answered_at::text, ', ') as dates_reponses
FROM user_answers ua
JOIN users u ON ua.user_id = u.id
WHERE u.email = 'admin13@email.com'
GROUP BY ua.question_id
HAVING COUNT(*) > 1
ORDER BY nombre_reponses_meme_question DESC;

-- 5. Vérifier les questions assignées à cet utilisateur
SELECT 
    uq.user_id,
    uq.question_id,
    q.question,
    d.title as document_title
FROM user_questions uq
JOIN users u ON uq.user_id = u.id
JOIN qcm_questions q ON uq.question_id = q.id
JOIN documents d ON q.document_id = d.id
WHERE u.email = 'admin13@email.com'
ORDER BY d.title, q.question; 