-- Fonction pour gérer la création d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'employee',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction quand un nouvel utilisateur est créé
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Vérifier que la table users existe avec la bonne structure
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'employee')) NOT NULL DEFAULT 'employee',
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Créer les policies nécessaires
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all data" ON public.users;
CREATE POLICY "Admins can read all data" ON public.users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    ); 