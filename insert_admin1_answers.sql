-- Insérer les réponses détaillées pour admin1@email.com
-- Score de 30% = 5 réponses correctes sur 16 questions

INSERT INTO user_answers (
    user_id,
    document_id,
    question_id,
    choice_id,
    is_correct,
    time_spent
) VALUES 
-- Question 1: Où se déroulera cette rencontre ? ✅ CORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '04233a39-46d4-41c7-940e-af595342ed16', 'bfa02cdd-53f5-45e3-b3b8-792303566b4b', true, 45),

-- Question 2: Quel est le site web pour s'inscrire ? ✅ CORRECT  
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '04b54f31-67b0-4a1c-986f-eadbc9239bda', '416b5468-526b-452b-80ae-1e117cdc719b', true, 30),

-- Question 3: Qui accompagnera Raphaël Glucksmann ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '0fbb9d80-6842-4e0b-8568-f949b965417f', '52ff8e01-bbbd-4c54-beed-7d4e9faf9812', false, 60),

-- Question 4: Combien d'adhérents avait Place publique ? ✅ CORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '112f979a-4eee-4be7-8920-b0d19af0dfe5', 'ffbae90d-ab2e-49d0-9438-221c3ae9880b', true, 25),

-- Question 5: Qui est invité à se réunir le 3 juillet ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '208ef241-a517-45e7-98d6-ea3ed904d3fc', '1f2bb16e-6930-47fb-bf42-373c6291c52a', false, 40),

-- Question 6: Quel est le but de l'initiative 'Prenons place !' ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '4d82df8a-9c58-4119-9aab-d0be2ab53180', '402068c3-30ab-49f2-80cd-f3d7d848e38f', false, 35),

-- Question 7: Quels sont les engagements de Place publique ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '7c4e840d-8033-434a-844f-670c12a7592e', '20d243eb-382f-458d-bcd2-99c7dafdb4aa', false, 50),

-- Question 8: Où peut-on trouver plus d'informations ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '8bb91a3f-22b1-4cfe-815d-a629f5de9489', '5158985c-1eee-42ed-8f71-f728b4ca1220', false, 20),

-- Question 9: Quelle initiative est mise en avant ? ✅ CORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '98e3f1d4-ba51-4e02-82f6-aa309e5acb5a', '5bbcd357-ea14-4c0a-a20b-300c896777c9', true, 30),

-- Question 10: Quel est l'objectif de l'initiative 'Prenons Place !' ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'a788f191-89b9-47fb-aa1b-99b61686b9a9', '12697693-d585-498a-95b1-5806c94507d0', false, 45),

-- Question 11: Quel jour et quelle heure aura lieu la rencontre ? ✅ CORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'b4ff8f8f-5ae4-47e7-9720-770eb6721fc6', '7c97dbf3-7268-4ade-bb77-a4f48da011c9', true, 15),

-- Question 12: Sur quels sujets ont porté les réunions publiques ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'b774be5d-7bca-4955-a5fe-750310ac16db', 'b977b806-b0e1-4e50-a34d-1b6b8124c30d', false, 55),

-- Question 13: Qui sont les co-présidents de Place publique ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'd54b1971-76a6-4432-ac2c-0c745bf16096', '0c925023-bd27-4a31-89f8-4a33d43378ca', false, 40),

-- Question 14: Qu'est-ce qui est mis en avant pour la victoire ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'd80ed5a0-81d5-4557-a02c-93dff87e4b53', '701047ba-4eed-43a6-b234-555a4dc16a02', false, 35),

-- Question 15: Quand a été fondé Place publique ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'db1380f1-fc50-4616-8f0d-096080c91be1', '43fcef4e-2036-4271-b0c7-afea6afff3fe', false, 25),

-- Question 16: Quel est l'objectif principal de cette rencontre ? ❌ INCORRECT
('26d35150-1090-4c45-bf31-e7fb02df731f', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'fe131292-5555-476e-8447-0ce205006ebb', '4c128f8c-67a5-4afe-9469-2586ca502ed8', false, 50);

-- Vérifier l'insertion
SELECT 
    COUNT(*) as nombre_reponses,
    COUNT(CASE WHEN is_correct THEN 1 END) as reponses_correctes,
    ROUND(COUNT(CASE WHEN is_correct THEN 1 END) * 100.0 / COUNT(*), 1) as pourcentage
FROM user_answers 
WHERE user_id = '26d35150-1090-4c45-bf31-e7fb02df731f' 
  AND document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'; 