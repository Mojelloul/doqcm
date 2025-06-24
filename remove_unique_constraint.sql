-- Supprimer la contrainte unique sur users_questions pour permettre les doublons
-- Cela permettra à un utilisateur d'avoir la même question plusieurs fois

-- Vérifier d'abord si la contrainte existe
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'users_questions'::regclass 
AND contype = 'u';

-- Supprimer la contrainte unique
ALTER TABLE users_questions DROP CONSTRAINT IF EXISTS users_questions_user_id_question_id_key;

-- Vérifier que la contrainte a été supprimée
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'users_questions'::regclass 
AND contype = 'u'; 