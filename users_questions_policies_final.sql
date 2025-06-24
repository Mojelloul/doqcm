-- Politiques RLS finales pour users_questions

-- Désactiver RLS sur users_questions
ALTER TABLE "public"."users_questions" DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can insert questions" ON users_questions;
DROP POLICY IF EXISTS "Users can view their own questions" ON users_questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON users_questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON users_questions;
DROP POLICY IF EXISTS "users_questions_insert_policy" ON users_questions;
DROP POLICY IF EXISTS "users_questions_select_policy" ON users_questions;
DROP POLICY IF EXISTS "users_questions_update_policy" ON users_questions;
DROP POLICY IF EXISTS "users_questions_delete_policy" ON users_questions;

-- Créer les nouvelles politiques (même si RLS est désactivé, on peut les garder pour la cohérence)

-- Politique pour permettre l'insertion
CREATE POLICY "Users can insert questions"
ON "public"."users_questions"
TO public
WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre la vue de ses propres questions
CREATE POLICY "Users can view their own questions"
ON "public"."users_questions"
TO public
USING (auth.uid() = user_id);

-- Vérifier l'état de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users_questions'
AND schemaname = 'public';

-- Vérifier les politiques créées
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users_questions'
ORDER BY policyname; 