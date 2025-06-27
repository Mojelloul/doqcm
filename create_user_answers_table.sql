-- Créer la table user_answers pour stocker les réponses détaillées des utilisateurs
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    question_id UUID REFERENCES qcm_questions(id) ON DELETE CASCADE,
    choice_id UUID REFERENCES qcm_choices(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    time_spent INTEGER, -- temps en secondes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_document_id ON user_answers(document_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_document ON user_answers(user_id, document_id);

-- Activer RLS (Row Level Security)
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres réponses
CREATE POLICY "Users can view their own answers"
    ON user_answers
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de voir toutes les réponses
CREATE POLICY "Admins can view all answers"
    ON user_answers
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Politique pour permettre l'insertion de réponses
CREATE POLICY "Users can insert their own answers"
    ON user_answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre la mise à jour de ses propres réponses
CREATE POLICY "Users can update their own answers"
    ON user_answers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Accorder les permissions nécessaires
GRANT ALL ON user_answers TO authenticated;

-- Vérifier que la table a été créée
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_answers'
ORDER BY ordinal_position; 