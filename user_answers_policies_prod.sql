-- Script pour créer les politiques RLS pour user_answers en production
-- Exécutez ce script dans votre base de données Supabase de production

-- 1. Activer RLS sur la table user_answers
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- 2. Politique pour permettre aux utilisateurs de voir leurs propres réponses
CREATE POLICY "Users can view their own answers" ON user_answers
    FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Politique pour permettre aux utilisateurs d'insérer leurs propres réponses
CREATE POLICY "Users can insert their own answers" ON user_answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Politique pour permettre aux propriétaires de documents de voir toutes les réponses
CREATE POLICY "Document owners can view all answers" ON user_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = user_answers.document_id 
            AND documents.owner_id = auth.uid()
        )
    );

-- 5. Politique pour permettre aux administrateurs de tout faire
CREATE POLICY "Admins can do everything" ON user_answers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 6. Vérifier les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_answers'; 