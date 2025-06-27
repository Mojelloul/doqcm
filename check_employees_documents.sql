-- Vérifier la structure de employees_documents
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Voir la structure de la table employees_documents
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees_documents' 
ORDER BY ordinal_position;

-- 2. Voir les données pour admin1@email.com
SELECT 
    ed.*,
    u.email
FROM employees_documents ed
LEFT JOIN users u ON ed.employee_id = u.id
WHERE u.email = 'admin1@email.com';

-- 3. Voir toutes les données de employees_documents
SELECT 
    ed.*,
    u.email,
    d.title as document_title
FROM employees_documents ed
LEFT JOIN users u ON ed.employee_id = u.id
LEFT JOIN documents d ON ed.document_id = d.id
ORDER BY ed.created_at DESC;

-- 4. Voir les données pour le document spécifique
SELECT 
    ed.*,
    u.email
FROM employees_documents ed
LEFT JOIN users u ON ed.employee_id = u.id
WHERE ed.document_id = '1f66ffec-c3f5-4510-8195-5f692cf8e768'; 