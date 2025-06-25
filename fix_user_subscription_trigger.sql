-- Modifier le trigger handle_new_user pour créer un abonnement par défaut
-- D'abord, s'assurer que l'offre gratuite existe
INSERT INTO public.offers (name, daily_document_limit, max_characters, max_recipients, price, description)
VALUES (
  'free',
  10,
  5000,
  20,
  0,
  'Plan gratuit - 10 documents par jour, 5000 caractères, 20 destinataires'
) ON CONFLICT (name) DO NOTHING;

-- Modifier la fonction handle_new_user pour inclure la création d'abonnement
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_offer_id UUID;
BEGIN
  -- Insérer l'utilisateur dans la table users
  INSERT INTO public.users (id, name, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'employee',
    NOW()
  );
  
  -- Récupérer l'ID de l'offre gratuite
  SELECT id INTO free_offer_id FROM public.offers WHERE name = 'free' LIMIT 1;
  
  -- Si l'offre gratuite existe, créer un abonnement par défaut
  IF free_offer_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, offer_id, status, start_date)
    VALUES (
      NEW.id,
      free_offer_id,
      'active',
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Le trigger existe déjà, pas besoin de le recréer
-- Mais on peut vérifier qu'il est bien en place
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 