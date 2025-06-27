-- Créer des réponses détaillées pour admin1@email.com
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Voir les questions du document
SELECT 
    qq.id as question_id,
    qq.question,
    COUNT(qc.id) as nombre_choix
FROM qcm_questions qq
LEFT JOIN qcm_choices qc ON qq.id = qc.question_id
WHERE qq.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
GROUP BY qq.id, qq.question
ORDER BY qq.id;

-- 2. Voir les choix pour chaque question
SELECT 
    qq.id as question_id,
    qq.question,
    qc.id as choice_id,
    qc.choice,
    qc.is_correct
FROM qcm_questions qq
JOIN qcm_choices qc ON qq.id = qc.question_id
WHERE qq.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'
ORDER BY qq.id, qc.id;

-- 3. Voir la structure des tables pour comprendre
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'qcm_questions' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'qcm_choices' 
ORDER BY ordinal_position;

-- 4. Insérer des réponses détaillées pour admin1@email.com
-- (Remplacez les IDs par les vrais IDs des questions et choix)

-- Exemple d'insertion (à adapter avec les vrais IDs) :
/*
INSERT INTO user_answers (
    user_id,
    document_id,
    question_id,
    choice_id,
    is_correct,
    time_spent
) VALUES 
-- Question 1 : Réponse correcte
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'QUESTION_ID_1', 'CHOICE_ID_CORRECT_1', true, 45),
-- Question 2 : Réponse incorrecte  
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'QUESTION_ID_2', 'CHOICE_ID_INCORRECT_2', false, 30),
-- Question 3 : Réponse correcte
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'QUESTION_ID_3', 'CHOICE_ID_CORRECT_3', true, 60);
*/ 