-- Politiques RLS finales pour documents

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can read their own documents" ON documents;
DROP POLICY IF EXISTS "Admins can read all documents" ON documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Admins can create documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

-- Créer les nouvelles politiques

-- Politique pour permettre la création de documents
CREATE POLICY "documents_insert_policy"
ON "public"."documents"
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Politique pour permettre la lecture de ses propres documents
CREATE POLICY "documents_select_policy"
ON "public"."documents"
TO authenticated
USING (owner_id = auth.uid());

-- Politique pour permettre la mise à jour de ses propres documents
CREATE POLICY "documents_update_policy"
ON "public"."documents"
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Politique pour permettre la suppression de ses propres documents
CREATE POLICY "documents_delete_policy"
ON "public"."documents"
TO authenticated
USING (owner_id = auth.uid());

-- Vérifier les politiques créées
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'documents'
ORDER BY policyname; 