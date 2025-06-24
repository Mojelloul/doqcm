-- Politiques RLS finales pour employees_documents

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can read their assigned documents" ON employees_documents;
DROP POLICY IF EXISTS "Admins can read all employee documents" ON employees_documents;
DROP POLICY IF EXISTS "Users can insert employee document assignments" ON employees_documents;
DROP POLICY IF EXISTS "Users can update employee document assignments" ON employees_documents;
DROP POLICY IF EXISTS "Users can delete employee document assignments" ON employees_documents;
DROP POLICY IF EXISTS "Document owners can read assignments" ON employees_documents;
DROP POLICY IF EXISTS "Document owners can insert assignments" ON employees_documents;
DROP POLICY IF EXISTS "Document owners can update assignments" ON employees_documents;
DROP POLICY IF EXISTS "Document owners can delete assignments" ON employees_documents;
DROP POLICY IF EXISTS "Employees can update their own scores" ON employees_documents;

-- Créer les nouvelles politiques

-- Politique pour permettre aux utilisateurs authentifiés de voir tous les documents d'employés
CREATE POLICY "allow_view_employee_documents"
ON "public"."employees_documents"
TO authenticated
USING (true);

-- Politique pour permettre l'insertion (partage de documents)
CREATE POLICY "employees_documents_insert_policy"
ON "public"."employees_documents"
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM documents d
    WHERE d.id = employees_documents.document_id 
    AND d.owner_id = auth.uid()
  )
);

-- Politique pour permettre la sélection (voir ses documents assignés)
CREATE POLICY "employees_documents_select_policy"
ON "public"."employees_documents"
TO authenticated
USING (employee_id = auth.uid());

-- Politique pour permettre la suppression (retirer le partage)
CREATE POLICY "employees_documents_delete_policy"
ON "public"."employees_documents"
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM documents d
    WHERE d.id = employees_documents.document_id 
    AND d.owner_id = auth.uid()
  )
);

-- Politique pour permettre aux employés de mettre à jour leurs scores
CREATE POLICY "employees_update_scores_policy"
ON "public"."employees_documents"
TO authenticated
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- Vérifier les politiques créées
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'employees_documents'
ORDER BY policyname; 