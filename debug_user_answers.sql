-- Script de diagnostic pour la table user_answers

-- 1. Vérifier si la table existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'user_answers'
AND table_schema = 'public';

-- 2. Si la table n'existe pas, la créer
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

-- 3. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_answers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Créer les index
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_document_id ON user_answers(document_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_document ON user_answers(user_id, document_id);

-- 5. Vérifier l'état de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_answers'
AND schemaname = 'public';

-- 6. Désactiver RLS temporairement pour les tests
ALTER TABLE user_answers DISABLE ROW LEVEL SECURITY;

-- 7. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
DROP POLICY IF EXISTS "Admins can view all answers" ON user_answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON user_answers;

-- 8. Créer des politiques simples pour les tests
CREATE POLICY "Allow all operations for authenticated users"
    ON user_answers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 9. Accorder les permissions
GRANT ALL ON user_answers TO authenticated;
GRANT ALL ON user_answers TO anon;

-- 10. Vérifier les politiques créées
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_answers'
ORDER BY policyname;

-- 11. Insérer des données de test (optionnel)
-- INSERT INTO user_answers (user_id, document_id, question_id, choice_id, is_correct, time_spent)
-- VALUES (
--     'user-id-here',
--     'document-id-here', 
--     'question-id-here',
--     'choice-id-here',
--     true,
--     30
-- );

-- 12. Vérifier les données
SELECT COUNT(*) as total_answers FROM user_answers; 