-- Créer les réponses détaillées pour admin5@email.com
-- Score de 20% = 2 réponses correctes sur 10 questions

INSERT INTO user_answers (
    user_id,
    document_id,
    question_id,
    choice_id,
    is_correct,
    time_spent
) VALUES 
-- Question 1: Où se déroulera cette rencontre ? ✅ CORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '04233a39-46d4-41c7-940e-af595342ed16', 'bfa02cdd-53f5-45e3-b3b8-792303566b4b', true, 45),

-- Question 2: Quel est le site web pour s'inscrire ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '04b54f31-67b0-4a1c-986f-eadbc9239bda', '42038c54-0762-4dab-a157-f01ddb4ee55e', false, 30),

-- Question 3: Qui accompagnera Raphaël Glucksmann ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '0fbb9d80-6842-4e0b-8568-f949b965417f', '52ff8e01-bbbd-4c54-beed-7d4e9faf9812', false, 60),

-- Question 4: Combien d'adhérents avait Place publique ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '112f979a-4eee-4be7-8920-b0d19af0dfe5', '8b4be66e-3955-423f-94bf-536c2fae6bdc', false, 25),

-- Question 5: Qui est invité à se réunir le 3 juillet ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '208ef241-a517-45e7-98d6-ea3ed904d3fc', '1f2bb16e-6930-47fb-bf42-373c6291c52a', false, 40),

-- Question 6: Quel est le but de l'initiative 'Prenons place !' ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '4d82df8a-9c58-4119-9aab-d0be2ab53180', '402068c3-30ab-49f2-80cd-f3d7d848e38f', false, 35),

-- Question 7: Quels sont les engagements de Place publique ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '7c4e840d-8033-434a-844f-670c12a7592e', '20d243eb-382f-458d-bcd2-99c7dafdb4aa', false, 50),

-- Question 8: Où peut-on trouver plus d'informations ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '8bb91a3f-22b1-4cfe-815d-a629f5de9489', '5158985c-1eee-42ed-8f71-f728b4ca1220', false, 20),

-- Question 9: Quelle initiative est mise en avant ? ❌ INCORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', '98e3f1d4-ba51-4e02-82f6-aa309e5acb5a', '3ade1545-ff3b-4fa9-a917-14c3c05ac233', false, 30),

-- Question 10: Quel est l'objectif de l'initiative 'Prenons Place !' ? ✅ CORRECT
('0dbc5c46-f426-42a5-bc63-9847708430c5', '1f66ffec-c3f5-4510-8195-5f692cf8e768', 'a788f191-89b9-47fb-aa1b-99b61686b9a9', '39155d26-43f6-4000-a21d-a1dfa862a712', true, 45);

-- Vérifier l'insertion
SELECT 
    COUNT(*) as nombre_reponses,
    COUNT(CASE WHEN is_correct THEN 1 END) as reponses_correctes,
    ROUND(COUNT(CASE WHEN is_correct THEN 1 END) * 100.0 / COUNT(*), 1) as pourcentage
FROM user_answers 
WHERE user_id = '0dbc5c46-f426-42a5-bc63-9847708430c5' 
  AND document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'; 