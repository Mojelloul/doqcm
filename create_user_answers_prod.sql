-- Script pour créer la table user_answers en production
-- Exécutez ce script dans votre base de données Supabase de production

-- 1. Créer la table user_answers
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES qcm_questions(id) ON DELETE CASCADE,
    choice_id UUID NOT NULL REFERENCES qcm_choices(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    time_spent INTEGER DEFAULT 0, -- en secondes
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_document_id ON user_answers(document_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_document ON user_answers(user_id, document_id);

-- 3. Créer la fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Créer le trigger pour updated_at
CREATE TRIGGER update_user_answers_updated_at 
    BEFORE UPDATE ON user_answers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Vérifier que la table a été créée
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_answers' 
ORDER BY ordinal_position; 