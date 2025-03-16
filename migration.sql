-- Créer une table temporaire pour sauvegarder les données existantes
CREATE TABLE temp_users AS SELECT * FROM users;
CREATE TABLE temp_documents AS SELECT * FROM documents;
CREATE TABLE temp_employees_documents AS SELECT * FROM employees_documents;
CREATE TABLE temp_qcm_results AS SELECT * FROM qcm_results;

-- Supprimer l'ancienne table et ses dépendances
DROP TABLE IF EXISTS users CASCADE;

-- Créer la nouvelle table liée à auth.users
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'employee')) NOT NULL,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer des utilisateurs dans auth.users pour les utilisateurs existants
INSERT INTO auth.users (id, email, email_confirmed_at)
SELECT id, email, NOW()
FROM temp_users;

-- Migrer les données des utilisateurs
INSERT INTO users (id, name, email, role, admin_id, created_at)
SELECT id, email as name, email, role, admin_id, created_at
FROM temp_users;

-- Recréer les contraintes de clé étrangère pour les autres tables
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE employees_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE qcm_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restaurer les données
INSERT INTO documents SELECT * FROM temp_documents;
INSERT INTO employees_documents SELECT * FROM temp_employees_documents;
INSERT INTO qcm_results SELECT * FROM temp_qcm_results;

-- Supprimer les tables temporaires
DROP TABLE temp_users;
DROP TABLE temp_documents;
DROP TABLE temp_employees_documents;
DROP TABLE temp_qcm_results;

-- Activer RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Créer une policy pour permettre l'insertion lors de l'inscription
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Créer une policy pour permettre la lecture de son propre profil
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Créer une policy pour permettre aux admins de tout voir
CREATE POLICY "Admins can read all data" ON users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Ajouter des policies pour les documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own documents" ON documents
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Admins can read all documents" ON documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Ajouter des policies pour les résultats QCM
ALTER TABLE qcm_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own results" ON qcm_results
    FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can read all results" ON qcm_results
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Ajouter des policies pour les documents des employés
ALTER TABLE employees_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their assigned documents" ON employees_documents
    FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can read all employee documents" ON employees_documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    ); 