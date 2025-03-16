# Application d'Analyse de Texte

## Technologies Utilisées

- Next.js 14 (App Router)
- React
- TypeScript
- Shadcn UI
- Supabase (PostgreSQL)

## Structure de la Base de Données

### Tables

#### `users` (lié à auth.users)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### `documents`
```sql
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  owner_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### `employees_documents` (table de liaison)
```sql
CREATE TABLE public.employees_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES public.users(id) NOT NULL,
  document_id UUID REFERENCES public.documents(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(employee_id, document_id)
);
```

### Fonction RPC

Cette fonction permet de vérifier l'existence des utilisateurs dans auth.users :

```sql
CREATE OR REPLACE FUNCTION public.check_users_exist(user_emails text[])
RETURNS TABLE (id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email = ANY(user_emails);
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.check_users_exist(text[]) TO authenticated;
```

### Politiques de Sécurité (RLS)

#### Documents
```sql
-- Lecture : l'utilisateur peut voir ses propres documents et ceux qui lui sont partagés
CREATE POLICY "Users can view own documents and shared with them" ON "public"."documents"
FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM employees_documents 
    WHERE document_id = documents.id 
    AND employee_id = auth.uid()
  )
);

-- Création : l'utilisateur peut créer ses propres documents
CREATE POLICY "Users can create own documents" ON "public"."documents"
FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Modification/Suppression : uniquement le propriétaire
CREATE POLICY "Users can update own documents" ON "public"."documents"
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own documents" ON "public"."documents"
FOR DELETE USING (auth.uid() = owner_id);
```

#### Employees Documents
```sql
-- Lecture : l'utilisateur peut voir ses propres partages
CREATE POLICY "Users can view own shares" ON "public"."employees_documents"
FOR SELECT USING (
  employee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM documents 
    WHERE id = employees_documents.document_id 
    AND owner_id = auth.uid()
  )
);

-- Création : uniquement le propriétaire du document peut partager
CREATE POLICY "Only document owners can share" ON "public"."employees_documents"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM documents 
    WHERE id = employees_documents.document_id 
    AND owner_id = auth.uid()
  )
);

-- Suppression : uniquement le propriétaire du document
CREATE POLICY "Only document owners can remove shares" ON "public"."employees_documents"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM documents 
    WHERE id = employees_documents.document_id 
    AND owner_id = auth.uid()
  )
);
```

## Fonctionnalités Principales

### Formulaire d'Analyse de Texte
- Champs :
  - Titre (obligatoire)
  - Texte à analyser (100-3000 caractères)
  - Résumé (max 250 caractères)
  - Emails des destinataires (1-3 emails)

### Système de Partage
- Validation des emails en temps réel
- Limite de 3 destinataires maximum
- Vérification de l'existence des utilisateurs dans la base de données
- Création automatique des liens de partage

### Sécurité
- Authentification requise pour toutes les opérations
- Vérification des permissions via RLS
- Validation des données côté client et serveur
- Protection contre les injections SQL via Supabase

## Requêtes SQL Utiles

### Récupérer les documents d'un utilisateur
```sql
SELECT d.* 
FROM documents d
WHERE d.owner_id = auth.uid()
ORDER BY d.created_at DESC;
```

### Récupérer les documents partagés avec un utilisateur
```sql
SELECT d.* 
FROM documents d
JOIN employees_documents ed ON d.id = ed.document_id
WHERE ed.employee_id = auth.uid()
ORDER BY ed.created_at DESC;
```

### Récupérer les partages d'un document
```sql
SELECT u.email
FROM users u
JOIN employees_documents ed ON u.id = ed.employee_id
WHERE ed.document_id = :document_id;
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
