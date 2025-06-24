-- Politiques RLS finales pour les tables QCM

-- Politiques pour qcm_questions
DROP POLICY IF EXISTS "Users can create questions" ON qcm_questions;
DROP POLICY IF EXISTS "Users can read questions" ON qcm_questions;
DROP POLICY IF EXISTS "Users can update questions" ON qcm_questions;
DROP POLICY IF EXISTS "Users can delete questions" ON qcm_questions;

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

-- Politiques pour qcm_choices
DROP POLICY IF EXISTS "Users can create choices" ON qcm_choices;
DROP POLICY IF EXISTS "Users can read choices" ON qcm_choices;
DROP POLICY IF EXISTS "Users can update choices" ON qcm_choices;
DROP POLICY IF EXISTS "Users can delete choices" ON qcm_choices;

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

-- Politiques pour users_questions
DROP POLICY IF EXISTS "Users can view their own questions" ON users_questions;
DROP POLICY IF EXISTS "Users can insert questions" ON users_questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON users_questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON users_questions;

CREATE POLICY "users_questions_insert_policy"
ON "public"."users_questions"
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_questions_select_policy"
ON "public"."users_questions"
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_questions_update_policy"
ON "public"."users_questions"
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_questions_delete_policy"
ON "public"."users_questions"
TO authenticated
USING (user_id = auth.uid());

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