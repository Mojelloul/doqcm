-- Politiques RLS finales pour les tables QCM (Version mise à jour)

-- Politiques pour qcm_questions (RLS activé avec politiques simples)
DROP POLICY IF EXISTS "Users can create questions" ON qcm_questions;
DROP POLICY IF EXISTS "Users can read questions" ON qcm_questions;
DROP POLICY IF EXISTS "Users can update questions" ON qcm_questions;
DROP POLICY IF EXISTS "Users can delete questions" ON qcm_questions;
DROP POLICY IF EXISTS "qcm_questions_insert_policy" ON qcm_questions;
DROP POLICY IF EXISTS "qcm_questions_select_policy" ON qcm_questions;
DROP POLICY IF EXISTS "qcm_questions_update_policy" ON qcm_questions;
DROP POLICY IF EXISTS "qcm_questions_delete_policy" ON qcm_questions;

-- Activer RLS sur qcm_questions
ALTER TABLE "public"."qcm_questions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qcm_questions_insert_policy"
ON "public"."qcm_questions"
TO authenticated
WITH CHECK (true);

CREATE POLICY "qcm_questions_select_policy"
ON "public"."qcm_questions"
TO authenticated
USING (true);

CREATE POLICY "qcm_questions_update_policy"
ON "public"."qcm_questions"
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "qcm_questions_delete_policy"
ON "public"."qcm_questions"
TO authenticated
USING (true);

-- Politiques pour qcm_choices (RLS activé avec politiques simples)
DROP POLICY IF EXISTS "Users can create choices" ON qcm_choices;
DROP POLICY IF EXISTS "Users can read choices" ON qcm_choices;
DROP POLICY IF EXISTS "Users can update choices" ON qcm_choices;
DROP POLICY IF EXISTS "Users can delete choices" ON qcm_choices;
DROP POLICY IF EXISTS "qcm_choices_insert_policy" ON qcm_choices;
DROP POLICY IF EXISTS "qcm_choices_select_policy" ON qcm_choices;
DROP POLICY IF EXISTS "qcm_choices_update_policy" ON qcm_choices;
DROP POLICY IF EXISTS "qcm_choices_delete_policy" ON qcm_choices;

-- Activer RLS sur qcm_choices
ALTER TABLE "public"."qcm_choices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qcm_choices_insert_policy"
ON "public"."qcm_choices"
TO authenticated
WITH CHECK (true);

CREATE POLICY "qcm_choices_select_policy"
ON "public"."qcm_choices"
TO authenticated
USING (true);

CREATE POLICY "qcm_choices_update_policy"
ON "public"."qcm_choices"
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "qcm_choices_delete_policy"
ON "public"."qcm_choices"
TO authenticated
USING (true);

-- users_questions est géré dans un script séparé (RLS désactivé)

-- Vérifier l'état de RLS sur toutes les tables QCM
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('qcm_questions', 'qcm_choices', 'users_questions')
AND schemaname = 'public'
ORDER BY tablename;

-- Vérifier toutes les politiques créées
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('qcm_questions', 'qcm_choices', 'users_questions')
ORDER BY tablename, policyname; 